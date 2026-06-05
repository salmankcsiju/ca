from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import User, Category, Product, ClientDiary, Order, OrderItem, ProductImage, ActivityLog, CustomizationOption, ChatMessage, AtelierSetting
from .serializers import UserSerializer, CategorySerializer, ProductSerializer, ClientDiarySerializer, OrderSerializer, ActivityLogSerializer, CustomerSerializer, CustomizationOptionSerializer, ChatMessageSerializer, AtelierSettingSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login_or_register(request):
    phone = request.data.get('phone_number')
    name = request.data.get('name', 'User')
    whatsapp = request.data.get('whatsapp_number', '')

    if not phone:
        return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)

    user, created = User.objects.get_or_create(
        phone_number=phone,
        defaults={'username': phone, 'first_name': name, 'whatsapp_number': whatsapp}
    )
    
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data,
        'is_new': created
    })

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    if request.method in ['PUT', 'PATCH']:
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    return Response(UserSerializer(request.user).data)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsAuthenticated()]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated and user.is_staff:
            return Product.objects.all().order_by('-created_at')
        
        queryset = Product.objects.filter(in_stock=True)
        category = self.request.query_params.get('category', None)
        if category is not None:
            queryset = queryset.filter(category_id=category)
        return queryset.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        images = request.FILES.getlist('images')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        
        for idx, img in enumerate(images):
            ProductImage.objects.create(
                product=product,
                image=img,
                is_main=(idx == 0)
            )
        
        ActivityLog.objects.create(
            user=request.user,
            action="Created Product",
            details=f"Added new product: {product.name} (Price: {product.price})"
        )
        return Response(self.get_serializer(product).data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        product = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user,
            action="Updated Product",
            details=f"Updated product: {product.name} (Price: {product.price}, In Stock: {product.in_stock})"
        )

    def perform_destroy(self, instance):
        name = instance.name
        instance.delete()
        ActivityLog.objects.create(
            user=self.request.user,
            action="Deleted Product",
            details=f"Deleted product: {name}"
        )

class ClientDiaryViewSet(viewsets.ModelViewSet):
    queryset = ClientDiary.objects.all()
    serializer_class = ClientDiarySerializer

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated and user.is_staff:
            return ClientDiary.objects.all().order_by('-created_at')
        return ClientDiary.objects.filter(is_approved=True).order_by('-created_at')

    def perform_create(self, serializer):
        if self.request.user.is_staff and 'user' in serializer.validated_data:
            serializer.save()
        else:
            serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        old_diary = self.get_object()
        old_approved = old_diary.is_approved
        diary = serializer.save()
        if old_approved != diary.is_approved:
            action_str = "Approved Client Diary" if diary.is_approved else "Rejected Client Diary"
            ActivityLog.objects.create(
                user=self.request.user,
                action=action_str,
                details=f"Diary ID: {diary.id} by {diary.user.username} for {diary.product.name}"
            )

    def perform_destroy(self, instance):
        username = instance.user.username
        product_name = instance.product.name
        instance.delete()
        ActivityLog.objects.create(
            user=self.request.user,
            action="Deleted Client Diary",
            details=f"Deleted lookbook entry by {username} for {product_name}"
        )

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        old_order = self.get_object()
        old_status = old_order.status
        order = serializer.save()
        if old_status != order.status:
            ActivityLog.objects.create(
                user=self.request.user,
                action="Updated Order Status",
                details=f"Order #{order.id} status changed from '{old_status}' to '{order.status}'"
            )

class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.filter(is_staff=True).order_by('-id')
        return User.objects.none()

    def create(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response({'detail': 'Only superusers can create staff accounts.'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        data['is_staff'] = True
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        ActivityLog.objects.create(
            user=request.user,
            action="Created Staff Account",
            details=f"Registered new staff: {user.username} (Role: {'Superadmin' if user.is_superuser else 'Staff'})"
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response({'detail': 'Only superusers can modify staff accounts.'}, status=status.HTTP_403_FORBIDDEN)
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        old_active = instance.is_active
        old_super = instance.is_superuser

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        details_log = []
        if old_active != user.is_active:
            details_log.append(f"Active: {user.is_active}")
        if old_super != user.is_superuser:
            details_log.append(f"Superadmin: {user.is_superuser}")

        if details_log:
            ActivityLog.objects.create(
                user=request.user,
                action="Updated Staff Account",
                details=f"Updated staff '{user.username}': " + ", ".join(details_log)
            )

        return Response(serializer.data)

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return ActivityLog.objects.all().order_by('-timestamp')
        return ActivityLog.objects.none()

class CustomerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.filter(is_staff=False).prefetch_related('orders', 'orders__items', 'orders__items__product').order_by('-date_joined')
        return User.objects.none()

class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        total_revenue = Order.objects.exclude(status='Cancelled').aggregate(total=Sum('total_amount'))['total'] or 0
        total_orders = Order.objects.count()
        total_products = Product.objects.count()
        total_reviews = ClientDiary.objects.count()

        orders_by_status = Order.objects.values('status').annotate(count=Count('id'))
        status_counts = {item['status']: item['count'] for item in orders_by_status}

        category_revenue = {}
        for item in OrderItem.objects.select_related('product__category').exclude(order__status='Cancelled'):
            cat_name = item.product.category.name if item.product.category else "Uncategorized"
            revenue = float(item.product.price) * item.quantity
            category_revenue[cat_name] = category_revenue.get(cat_name, 0) + revenue

        product_sales = {}
        for item in OrderItem.objects.select_related('product').exclude(order__status='Cancelled'):
            prod_name = item.product.name
            qty = item.quantity
            product_sales[prod_name] = product_sales.get(prod_name, 0) + qty
        top_products = [{"name": name, "sales": qty} for name, qty in sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]]

        chart_data = []
        today = timezone.now().date()
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            day_orders = Order.objects.filter(created_at__date=date).exclude(status='Cancelled')
            day_sales = day_orders.aggregate(total=Sum('total_amount'))['total'] or 0
            chart_data.append({
                "date": date.strftime("%b %d"),
                "sales": float(day_sales),
                "orders": day_orders.count()
            })

        return Response({
            "metrics": {
                "total_revenue": float(total_revenue),
                "total_orders": total_orders,
                "total_products": total_products,
                "total_reviews": total_reviews
            },
            "status_distribution": status_counts,
            "category_revenue": category_revenue,
            "top_products": top_products,
            "chart_data": chart_data
        })


class CustomizationOptionViewSet(viewsets.ModelViewSet):
    queryset = CustomizationOption.objects.all()
    serializer_class = CustomizationOptionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return CustomizationOption.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        # Auto-seed if empty
        if not CustomizationOption.objects.exists():
            default_options = [
                # Sleeves
                ('sleeve', 'Sleeveless', 'sleeveless', 0, ''),
                ('sleeve', 'Puff Sleeve', 'puff', 0, ''),
                ('sleeve', 'Full Sleeve', 'full', 0, ''),
                ('sleeve', 'Balloon Sleeve', 'balloon', 0, ''),
                # Necks
                ('neck', 'Round Neck', 'round', 0, ''),
                ('neck', 'V-Neck', 'vneck', 0, ''),
                ('neck', 'Square Neck', 'square', 0, ''),
                # Lengths
                ('length', 'Short Dress', 'short', 0, ''),
                ('length', 'Midi Dress', 'midi', 0, ''),
                ('length', 'Maxi Dress', 'maxi', 0, ''),
                # Fabrics
                ('fabric', 'Premium Silk', 'silk', 0, 'Glossy and luxurious'),
                ('fabric', 'Lustrous Satin', 'satin', 0, 'Smooth drape, high sheen'),
                ('fabric', 'Pure Linen', 'linen', 0, 'Lightweight, breathable'),
                ('fabric', 'Soft Cotton', 'cotton', 0, 'Comfortable everyday wear'),
                # Colors
                ('color', 'Blush Rose', 'rose', 0, '#E8C5C8'),
                ('color', 'Lavender Glow', 'lavender', 0, '#E2D9F3'),
                ('color', 'Oatmeal Beige', 'beige', 0, '#E8DFD3'),
                ('color', 'Soft Cream', 'cream', 0, '#FAF6EE'),
                ('color', 'Cabernet Wine', 'wine', 0, '#5C1D24'),
            ]
            for opt_type, name, code, price, desc in default_options:
                CustomizationOption.objects.create(
                    option_type=opt_type,
                    name=name,
                    code=code,
                    extra_price=price,
                    description=desc
                )
        return super().list(request, *args, **kwargs)


class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            queryset = ChatMessage.objects.all()
            customer_param = self.request.query_params.get('customer')
            if customer_param:
                queryset = queryset.filter(customer_id=customer_param)
            return queryset.order_by('timestamp')
        
        return ChatMessage.objects.filter(customer=user).order_by('timestamp')

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_staff:
            customer_id = self.request.data.get('customer')
            if not customer_id:
                raise serializers.ValidationError({"customer": "This field is required for staff replies."})
            try:
                customer = User.objects.get(id=customer_id)
            except User.DoesNotExist:
                raise serializers.ValidationError({"customer": "Customer user does not exist."})
            serializer.save(sender=user, customer=customer)
        else:
            serializer.save(sender=user, customer=user)

    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        user = request.user
        if user.is_staff:
            customer_id = request.data.get('customer')
            if not customer_id:
                return Response({'error': 'Customer ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            ChatMessage.objects.filter(customer_id=customer_id, sender__is_staff=False).update(is_read=True)
        else:
            ChatMessage.objects.filter(customer=user, sender__is_staff=True).update(is_read=True)
        return Response({'status': 'messages marked as read'})


class AtelierSettingViewSet(viewsets.ModelViewSet):
    queryset = AtelierSetting.objects.all()
    serializer_class = AtelierSettingSerializer

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        if not AtelierSetting.objects.exists():
            default_settings = {
                "brand_name": "CASA AMORA",
                "description": "Casa Amora is a luxury bespoke boutique offering personalized sewing, premium fabrics, and private bridal consultations. Meet our master couturiers to sketch, fit, and build your dream closet.",
                "address": "Casa Amora Atelier, Marine Drive, Kochi, Kerala — 682031",
                "helpline": "+91 98765 43210 (Toll Free)",
                "email": "boutique@casaamora.com",
                "hours": "Mon — Sat: 10:00 AM — 08:00 PM IST",
                "whatsapp": "919876543210"
            }
            for k, v in default_settings.items():
                AtelierSetting.objects.create(key=k, value=v)
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=['post'])
    def update_batch(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        for k, v in data.items():
            AtelierSetting.objects.update_or_create(key=k, defaults={'value': v})
            
        return Response({'status': 'Settings updated successfully'})

import io
from django.core.management import call_command

@api_view(['GET'])
@permission_classes([AllowAny])
def run_migrations_view(request):
    out = io.StringIO()
    err = io.StringIO()
    try:
        call_command('migrate', interactive=False, stdout=out, stderr=err)
        migration_output = out.getvalue()
        migration_error = err.getvalue()
        
        # Try to seed as well
        seed_out = io.StringIO()
        seed_err = io.StringIO()
        call_command('seed', stdout=seed_out, stderr=seed_err)
        seed_output = seed_out.getvalue()
        seed_error = seed_err.getvalue()
        
        return Response({
            'status': 'success',
            'migration_output': migration_output,
            'migration_error': migration_error,
            'seed_output': seed_output,
            'seed_error': seed_error
        })
    except Exception as e:
        import traceback
        return Response({
            'status': 'error',
            'error': str(e),
            'traceback': traceback.format_exc(),
            'migration_output': out.getvalue(),
            'migration_error': err.getvalue()
        }, status=500)


from rest_framework.authtoken.views import ObtainAuthToken

class CustomObtainAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        # 1. Run migrations and seed on-demand
        try:
            from django.core.management import call_command
            call_command('migrate', interactive=False)
            
            from api.models import Product
            if Product.objects.count() == 0:
                call_command('seed')
        except Exception as e:
            print(f"Error executing on-demand migrations/seeding: {e}")
            
        # 2. Call standard ObtainAuthToken logic
        return super().post(request, *args, **kwargs)

obtain_auth_token = CustomObtainAuthToken.as_view()




