# 1Fi Marketplace

A full-stack mock implementation of the 1Fi Marketplace using **Python + FastAPI + HTML/CSS/JavaScript**.

## What is implemented

- Shop page with:
  - Top Brands (blank/placeholder as allowed)
  - Nearby Stores (blank/placeholder as allowed)
  - 1Fi Marketplace
- Marketplace product listing
- Product images, names, brands, categories and pricing
- Search
- Category filters
- Product detail modal
- Product variants
- Dynamic EMI calculation endpoint
- EMI plan selection
- Proceed CTA
- Loading states
- Error/retry state
- Empty state
- Responsive mobile/tablet/desktop layout
- Reusable frontend rendering functions
- REST-style mock API endpoints

## Project structure

```text
onefi_marketplace/
├── app/
│   ├── data/
│   │   └── products.py
│   ├── static/
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       └── app.js
│   ├── templates/
│   │   └── index.html
│   ├── __init__.py
│   └── main.py
├── requirements.txt
├── run.py
└── README.md
```

## Run locally

### 1. Create and activate a virtual environment

Windows PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Windows CMD:

```cmd
python -m venv venv
venv\Scripts\activate
```

macOS/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the server

```bash
python run.py
```

Then open:

```text
http://127.0.0.1:8000
```

FastAPI API docs:

```text
http://127.0.0.1:8000/docs
```

## API endpoints

### Get products

```http
GET /api/products
```

Optional:

```http
GET /api/products?category=Mobiles
GET /api/products?search=iphone
```

### Get one product

```http
GET /api/products/iphone-15
```

### Get EMI plans

```http
GET /api/products/iphone-15/emi?variant_id=iphone-15-128
```

## Engineering notes

The UI does not own the product dataset. Product data is served through FastAPI endpoints and the frontend fetches it asynchronously.

The EMI endpoint recalculates monthly payment information from the selected product variant, so changing a variant changes the displayed EMI data.

For a production application, the mock data module can be replaced with a database/repository layer without changing the marketplace UI contract.

## Assignment mapping

| Assignment requirement | Implementation |
|---|---|
| Top Brands | Placeholder |
| Nearby Stores | Placeholder |
| 1Fi Marketplace | Fully implemented |
| Product listing | `/api/products` + product grid |
| Product image | Product data + responsive image |
| Product name | Product data |
| Pricing | Variant-based pricing |
| Variants | Variant selector |
| EMI plans | `/api/products/{id}/emi` |
| Select EMI | Radio selection + state |
| CTA | Proceed button |
| Dynamic data | FastAPI endpoints |
| Loading state | Async loading UI |
| Error state | Retry UI |
| Responsive | CSS breakpoints |
| Reusable structure | API/data/UI separation |
