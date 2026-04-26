import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import User, Category, Product, ProductImage, ClientDiary, Order, OrderItem, ActivityLog
from rest_framework.authtoken.models import Token

class Command(BaseCommand):
    help = 'Seeds the database with beautiful fashion e-commerce dummy data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # Ensure superuser exists and has token
        superuser, created = User.objects.get_or_create(
            username='salman',
            defaults={
                'first_name': 'Salman',
                'is_staff': True,
                'is_superuser': True,
                'phone_number': '9876543210',
                'email': 'salman@casaamora.com'
            }
        )
        if created:
            superuser.set_password('salman')
            superuser.save()
            self.stdout.write('Created superuser salman/salman')
        Token.objects.get_or_create(user=superuser)

        # Create dummy client users
        clients_data = [
            ('aiswarya', 'Aiswarya R', '9988776655'),
            ('meera', 'Meera Nair', '8877665544'),
            ('anjali', 'Anjali Krishna', '7766554433'),
            ('shruti', 'Shruti Suresh', '6655443322')
        ]
        clients = []
        for username, name, phone in clients_data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': name,
                    'phone_number': phone,
                    'is_staff': False
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            clients.append(user)
            Token.objects.get_or_create(user=user)

        # Create Categories
        women_cat, _ = Category.objects.get_or_create(name='Women')
        kids_cat, _ = Category.objects.get_or_create(name='Kids')

        women_subcategories = ['Churidhar', 'Abaya', 'Maxi', 'Saree', 'Kurthy']
        kids_subcategories = ['Frocks', 'Ethnic Wear', 'Casual Wear']

        categories_map = {}
        for sub in women_subcategories:
            cat, _ = Category.objects.get_or_create(name=sub, parent=women_cat)
            categories_map[sub] = cat

        for sub in kids_subcategories:
            cat, _ = Category.objects.get_or_create(name=sub, parent=kids_cat)
            categories_map[sub] = cat

        # Create Products
        products_data = [
            ('Velvet Maxi Dress', 3499, 'Maxi', 'Deep velvet red maxi dress with custom gold embroidery. Dry clean only.'),
            ('Silk Churidhar Set', 2899, 'Churidhar', 'Handwoven tussar silk churidhar. Royal blue shade. Wash separately.'),
            ('Premium Linen Abaya', 4199, 'Abaya', 'Breathable linen abaya with wide sleeves. Black and gold piping.'),
            ('Organza Floral Saree', 5499, 'Saree', 'Pastel pink organza saree with delicate floral motifs.'),
            ('Casual Cotton Kurthy', 1299, 'Kurthy', 'Everyday wear handblock printed cotton kurthy. Indigo blue.'),
            ('Embroidered Frock', 1899, 'Frocks', 'A-line cotton silk frock for kids. Pearl white and baby pink details.'),
            ('Kids Ethnic Lehenga', 3199, 'Ethnic Wear', 'Mini traditional lehenga set for festive occasions.')
        ]

        products = []
        for name, price, sub_cat_name, desc in products_data:
            cat = categories_map[sub_cat_name]
            prod, created = Product.objects.get_or_create(
                name=name,
                defaults={
                    'category': cat,
                    'price': price,
                    'description': desc,
                    'material': 'Premium Fabric',
                    'washing_instructions': 'Dry Clean Preferred',
                    'in_stock': True
                }
            )
            products.append(prod)

            # Assign dummy images using placeholder online URLs if no local ones exist
            # Note: We can write empty product images or placeholders
            if created or not prod.images.exists():
                # We can save a placeholder image or leave it blank
                pass

        # Create Orders
        orders_data = [
            (clients[0], 6398.00, 'Pending', [
                (products[0], 'M', 1, None),
                (products[1], 'Custom', 1, {'note': 'Height: 160cm, Bust: 36 inches'})
            ]),
            (clients[1], 4199.00, 'Processing', [
                (products[2], 'L', 1, None)
            ]),
            (clients[2], 5499.00, 'Shipped', [
                (products[3], 'Custom', 1, {'note': 'Saree length adjustments request'})
            ]),
            (clients[3], 3198.00, 'Delivered', [
                (products[4], 'S', 1, None),
                (products[5], '6-7 Years', 1, None)
            ])
        ]

        for client, total, status, items in orders_data:
            # Avoid duplicate orders by checking client and total amount
            order, created = Order.objects.get_or_create(
                user=client,
                total_amount=total,
                status=status,
                defaults={'created_at': timezone.now()}
            )
            if created:
                for prod, size, qty, custom in items:
                    OrderItem.objects.create(
                        order=order,
                        product=prod,
                        size=size,
                        quantity=qty,
                        custom_measurements=custom
                    )

        # Create Client Diaries Lookbook (Approved & Unapproved)
        # Avoid duplicate diary entries
        if not ClientDiary.objects.exists():
            ClientDiary.objects.create(
                user=clients[0],
                product=products[0],
                review_text="Beautiful velvet fabric! Got so many compliments at the wedding.",
                is_approved=True
            )
            ClientDiary.objects.create(
                user=clients[1],
                product=products[1],
                review_text="Perfect custom stitching! The fit is incredibly precise.",
                is_approved=False
            )

        # Create dummy staff users
        staff_data = [
            ('anu', 'Anu Thomas', '9876543201', False),
            ('rahul', 'Rahul Dev', '9876543202', False),
        ]
        staff_members = []
        for username, name, phone, is_super in staff_data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': name,
                    'phone_number': phone,
                    'is_staff': True,
                    'is_superuser': is_super
                }
            )
            if created:
                user.set_password(f'{username}123')
                user.save()
            staff_members.append(user)
            Token.objects.get_or_create(user=user)

        # Create dummy Activity Logs
        if not ActivityLog.objects.exists():
            logs_data = [
                (superuser, "Created Staff Account", "Registered new staff: anu (Role: Staff)"),
                (superuser, "Created Staff Account", "Registered new staff: rahul (Role: Staff)"),
                (staff_members[0], "Created Product", f"Added new product: {products[0].name}"),
                (staff_members[1], "Updated Product", f"Updated product: {products[1].name}"),
                (superuser, "Approved Client Diary", f"Diary ID: 1 by {clients[0].username} for {products[0].name}"),
                (staff_members[0], "Updated Order Status", "Order #2 status changed from 'Pending' to 'Processing'"),
            ]
            for user, action, details in logs_data:
                ActivityLog.objects.create(
                    user=user,
                    action=action,
                    details=details
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
