from rest_framework import serializers
from django.db.models import Sum
from .models import User, Category, Product, ProductImage, ClientDiary, Order, OrderItem, ActivityLog, CustomizationOption, ChatMessage, AtelierSetting

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'name', 'phone_number', 'whatsapp_number', 'is_staff', 'is_active', 'is_superuser']
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'parent']

class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'is_main']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'material', 'washing_instructions', 'in_stock', 'category', 'category_name', 'images']

class ClientDiarySerializer(serializers.ModelSerializer):
    client_image_url = serializers.SerializerMethodField()
    user_name = serializers.CharField(source='user.name', read_only=True, default="Anonymous")
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image_url = serializers.SerializerMethodField()

    class Meta:
        model = ClientDiary
        fields = ['id', 'user_name', 'user', 'product', 'product_name', 'product_image_url', 'client_image', 'client_image_url', 'review_text', 'is_approved', 'created_at']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'client_image': {'write_only': True, 'required': False},
            'user': {'required': False}
        }

    def get_client_image_url(self, obj):
        request = self.context.get('request')
        if obj.client_image:
            name = obj.client_image.name
            if name.startswith('http://') or name.startswith('https://'):
                return name
            if hasattr(obj.client_image, 'url'):
                if request:
                    return request.build_absolute_uri(obj.client_image.url)
                return obj.client_image.url
        return None

    def get_product_image_url(self, obj):
        request = self.context.get('request')
        first_image = obj.product.images.first()
        if first_image and first_image.image and hasattr(first_image.image, 'url'):
            if request:
                return request.build_absolute_uri(first_image.image.url)
            return first_image.image.url
        return None

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_price', 'size', 'quantity', 'custom_measurements']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'user_name', 'user_phone', 'total_amount', 'status', 'items', 'created_at']
        read_only_fields = ['user', 'total_amount', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Calculate total amount
        total = 0
        order = Order.objects.create(total_amount=0, **validated_data)
        
        for item_data in items_data:
            item = OrderItem.objects.create(order=order, **item_data)
            total += item.product.price * item.quantity
            
        order.total_amount = total
        order.save()
        return order

class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True, default="System")

    class Meta:
        model = ActivityLog
        fields = ['id', 'user_name', 'action', 'details', 'timestamp']

class CustomerSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', read_only=True)
    orders = OrderSerializer(many=True, read_only=True)
    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'phone_number', 'whatsapp_number', 'date_joined', 'orders', 'total_orders', 'total_spent']

    def get_total_orders(self, obj):
        return obj.orders.count()

    def get_total_spent(self, obj):
        total = obj.orders.exclude(status='Cancelled').aggregate(total=Sum('total_amount'))['total']
        return float(total) if total else 0


class CustomizationOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomizationOption
        fields = ['id', 'option_type', 'name', 'code', 'extra_price', 'description', 'is_active']


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    is_staff_sender = serializers.BooleanField(source='sender.is_staff', read_only=True)
    customer = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'sender_name', 'sender_username', 'is_staff_sender', 'customer', 'message', 'timestamp', 'is_read']
        read_only_fields = ['id', 'sender', 'timestamp']


class AtelierSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtelierSetting
        fields = ['id', 'key', 'value']



