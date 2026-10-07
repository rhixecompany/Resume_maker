<!-- markdownlint-disable MD033 MD036 MD041 MD045 MD059 -->
<div align="center">
  <br />
  <a href="#" target="_blank">
    <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop" alt="E-commerce Platform Banner">
  </a>
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Python-black?style=for-the-badge&logoColor=white&logo=python&color=3776AB" alt="python" />
    <img src="https://img.shields.io/badge/-Django-black?style=for-the-badge&logoColor=white&logo=django&color=092E20" alt="django" />
    <img src="https://img.shields.io/badge/-SQLite-black?style=for-the-badge&logoColor=white&logo=sqlite&color=003B57" alt="sqlite" />
    <img src="https://img.shields.io/badge/-HTML-black?style=for-the-badge&logoColor=white&logo=html5&color=E34F26" alt="html" />
    <img src="https://img.shields.io/badge/-CSS-black?style=for-the-badge&logoColor=white&logo=css3&color=1572B6" alt="css" />
  </div>

  <h3 align="center">E-commerce Platform</h3>

  <div align="center">
    A full-featured Django-based e-commerce platform for building online stores. Manage products, orders, customers, and payments with a robust, scalable solution.
  </div>
</div>

## 📋 Table of Contents

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🚀 [Quick Start](#quick-start)
5. 📊 [Business Value](#business-value)
6. 🔧 [Technical Details](#technical-details)
7. 📦 [Product Management](#product-management)
8. 🛒 [Shopping Flow](#shopping-flow)
9. 🚨 [FAQ / Troubleshooting](#faq)
10. 🔗 [Links](#links)

## 🤖 Introduction

This e-commerce platform is a Django-powered online store solution that provides all the essential features for running a modern online business. From product management to order processing, this platform handles the complete e-commerce lifecycle.

**Target Users**: Small to medium businesses looking to sell products online.

**Problem Solved**: Provides a ready-to-use foundation for online stores, reducing development time and cost while maintaining flexibility and scalability.

## ⚙️ Tech Stack

| Technology     | Version | Purpose                    |
| -------------- | ------- | -------------------------- |
| **Python**     | 3.11+   | Backend language           |
| **Django**     | 4.x     | Web framework              |
| **SQLite**     | -       | Database (default)         |
| **PostgreSQL** | 15+     | Production database        |
| **HTML/CSS**   | 5/3     | Frontend                   |
| **JavaScript** | ES6     | Frontend interactivity     |
| **Gunicorn**   | 21.x    | WSGI server                |
| **Nginx**      | -       | Reverse proxy (production) |

### Key Django Packages

- `django-crispy-forms` - Form rendering
- `django-allauth` - Authentication
- `pillow` - Image processing
- `django-cors-headers` - CORS support

## 🔋 Features

### For Customers

- 🛍️ **Product Catalog**: Browse products by category
- 🔍 **Search**: Find products quickly
- 📱 **Responsive Design**: Shop on any device
- 🛒 **Shopping Cart**: Add and manage items
- 💳 **Checkout**: Complete purchases
- 👤 **User Account**: Order history and profile

### For Store Administrators

- 📦 **Product Management**: Add, edit, delete products
- 📊 **Order Management**: Process and track orders
- 👥 **Customer Management**: View customer data
- 📈 **Sales Reports**: Track revenue and trends
- ⚙️ **Store Settings**: Configure store options

### Core Features

- **User Authentication**: Registration, login, password reset
- **Product Categories**: Organize products logically
- **Inventory Tracking**: Stock level management
- **Order Processing**: Complete order workflow
- **Payment Integration**: Ready for payment gateways
- **Email Notifications**: Order confirmations

## 🚀 Quick Start

### Prerequisites

- [Python](https://www.python.org/) (3.11+)
- [pip](https://pip.pypa.io/) or [poetry](https://python-poetry.org/)

### Installation

```bash
# Clone the repository
git clone https://github.com/rhixecompany/ecom.git
cd ecom

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Open [http://localhost:8000](http://localhost:8000) for the store, [http://localhost:8000/admin](http://localhost:8000/admin) for admin panel.

---

## 📊 Business Value

### For Store Owners

- 💰 **Cost-Effective**: Open-source, no licensing fees
- ⚡ **Fast Setup**: Get online in minutes
- 🔧 **Customizable**: Full control over functionality
- 📈 **Scalable**: Grow from small to large

### For Customers

- 🛒 **Convenient**: Easy online shopping experience
- 🔒 **Secure**: Safe transactions
- 📱 **Mobile-Friendly**: Shop on any device
- 🚚 **Order Tracking**: Know order status

### Key Outcomes

- ✅ Reduced time to launch online store
- ✅ Lower development and maintenance costs
- ✅ Mobile-responsive for modern shoppers
- ✅ Foundation for growth and expansion

---

## 🔧 Technical Details

### Project Structure

```
ecom/
├── ecom/                 # Django project settings
│   ├── settings.py      # Configuration
│   ├── urls.py          # URL routing
│   └── wsgi.py          # WSGI entry point
├── products/            # Product app
│   ├── models.py        # Product models
│   ├── views.py         # Views
│   ├── urls.py          # URLs
│   └── admin.py        # Admin configuration
├── orders/               # Order app
│   ├── models.py        # Order models
│   ├── views.py         # Views
│   └── signals.py       # Order signals
├── cart/                 # Shopping cart
│   ├── cart.py          # Cart logic
│   └── views.py         # Cart views
├── templates/            # HTML templates
│   ├── base.html        # Base template
│   ├── products/        # Product templates
│   └── orders/           # Order templates
├── static/               # Static files
│   ├── css/             # Stylesheets
│   └── js/              # JavaScript
├── media/               # User uploads
├── requirements.txt
└── manage.py
```

### Database Models

- **Product**: name, price, description, image, category, stock
- **Category**: name, slug, description
- **Order**: user, status, total, created_at
- **OrderItem**: order, product, quantity, price
- **User**: extended Django User model

### Key Patterns

- **MVC Architecture**: Clear separation of concerns
- **Django ORM**: Type-safe database queries
- **Class-Based Views**: Reusable view logic
- **Middleware**: Request/response processing

---

## 📦 Product Management

### Adding Products (Admin)

1. Navigate to `/admin`
2. Login with superuser credentials
3. Go to Products → Products
4. Click "Add Product"
5. Fill in details and save

### Product Model Fields

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/')
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    stock = models.PositiveIntegerField(default=0)
    available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
```

---

## 🛒 Shopping Flow

### Customer Journey

1. **Browse**: Visit store, view products
2. **Search**: Find specific items
3. **Add to Cart**: Select quantity
4. **Review Cart**: Check items
5. **Checkout**: Enter details
6. **Payment**: Process payment
7. **Confirmation**: Receive order email

### Cart Functionality

```python
# Add to cart
cart.add(product, quantity=1)

# Remove from cart
cart.remove(product)

# Get total
cart.get_total_price()

# Clear cart
cart.clear()
```

---

## 🚨 FAQ / Troubleshooting

### Common Issues

**Static files not loading**

- Run: `python manage.py collectstatic`
- Check STATIC_ROOT in settings

**Database errors**

- Run: `python manage.py migrate`
- Check database configuration

**Image upload not working**

- Verify MEDIA_ROOT and MEDIA_URL
- Check file permissions

**Admin access issues**

- Create superuser: `python manage.py createsuperuser`
- Check authentication settings

---

## 🔗 Links

- **GitHub**: [github.com/rhixecompany/ecom](https://github.com/rhixecompany/ecom)
- **Django Docs**: [docs.djangoproject.com](https://docs.djangoproject.com/)
- **Related Projects**:
  - [Horizon Banking](https://github.com/rhixecompany/banking)
  - [Rhixe Scans](https://github.com/rhixecompany/rhixe_scans)

---

## 📈 Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Newsletter subscription
- [ ] Advanced search with filters
- [ ] Multi-language support
- [ ] Inventory alerts

---

## 🤝 Contributing

Contributions welcome! Please check CONTRIBUTING.md for details.

---

## 📄 License

MIT License - see LICENSE file.

---

_Built with ❤️ by Alexander Iseghohi_
_Part of the rhixecompany portfolio - Building e-commerce solutions_
