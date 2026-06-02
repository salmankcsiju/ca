from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User

class CustomerAPITest(APITestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            username='staff',
            password='password',
            first_name='Staff',
            phone_number='1234567890',
            is_staff=True
        )
        self.customer = User.objects.create_user(
            username='customer',
            password='password',
            first_name='Customer',
            phone_number='0987654321',
            is_staff=False
        )
        
    def test_customers_endpoint_requires_auth(self):
        url = '/api/customers/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_customers_endpoint_staff_only(self):
        self.client.force_authenticate(user=self.customer)
        url = '/api/customers/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_customers_endpoint_for_staff(self):
        self.client.force_authenticate(user=self.staff_user)
        url = '/api/customers/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'customer')


from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Category, Product, ClientDiary

class ClientDiaryAPITest(APITestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            username='staff2',
            password='password',
            first_name='Staff 2',
            phone_number='12345678901',
            is_staff=True
        )
        self.customer = User.objects.create_user(
            username='customer2',
            password='password',
            first_name='Customer 2',
            phone_number='09876543212',
            is_staff=False
        )
        self.category = Category.objects.create(name="Dress")
        self.product = Product.objects.create(
            name="Silk Saree",
            price=2999.00,
            category=self.category
        )
        self.mock_image = SimpleUploadedFile(
            name="test_image.gif",
            content=b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;',
            content_type="image/gif"
        )

    def test_create_diary_endpoint_for_staff(self):
        self.client.force_authenticate(user=self.staff_user)
        url = '/api/diaries/'
        data = {
            'user': self.customer.id,
            'product': self.product.id,
            'review_text': 'Beautiful outfit, great custom sizing!',
            'client_image': self.mock_image,
            'is_approved': True
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user_name'], 'Customer 2')
        self.assertEqual(response.data['review_text'], 'Beautiful outfit, great custom sizing!')
        self.assertTrue(response.data['is_approved'])

    def test_approve_diary_endpoint(self):
        diary = ClientDiary.objects.create(
            user=self.customer,
            product=self.product,
            review_text="Test review",
            client_image=self.mock_image,
            is_approved=False
        )
        self.client.force_authenticate(user=self.staff_user)
        url = f'/api/diaries/{diary.id}/'
        response = self.client.patch(url, {'is_approved': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_approved'])

