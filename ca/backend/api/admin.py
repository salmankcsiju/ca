from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Category, Product, ProductImage, ClientDiary, Order, OrderItem, ActivityLog

class CustomUserAdmin(UserAdmin):
    model = User
    fieldsets = UserAdmin.fieldsets + (
        ('Contact Info', {'fields': ('phone_number', 'whatsapp_number')}),
    )

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'in_stock', 'created_at')
    list_filter = ('category', 'in_stock')
    search_fields = ('name', 'description')
    inlines = [ProductImageInline]

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'user__phone_number')
    inlines = [OrderItemInline]

class ClientDiaryAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'is_approved', 'created_at')
    list_filter = ('is_approved',)
    actions = ['approve_diaries']

    def approve_diaries(self, request, queryset):
        queryset.update(is_approved=True)
    approve_diaries.short_description = "Approve selected client diaries"

admin.site.register(User, CustomUserAdmin)
admin.site.register(Category)
admin.site.register(Product, ProductAdmin)
admin.site.register(ClientDiary, ClientDiaryAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(ActivityLog)
