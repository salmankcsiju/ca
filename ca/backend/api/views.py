from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import User, Category, Product, ClientDiary, Order, ProductImage, ActivityLog
from .serializers import UserSerializer, CategorySerializer, ProductSerializer, ClientDiarySerializer, OrderSerializer, ActivityLogSerializer

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
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
