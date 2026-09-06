from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .data.products import PRODUCTS

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="1Fi Marketplace",
    description="Mock marketplace API for the 1Fi SDE Intern Assignment",
    version="1.0.0",
)

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


@app.get("/", response_class=HTMLResponse)
async def shop(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "products": PRODUCTS
        }
    )


@app.get("/api/products")
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
):
    products = PRODUCTS

    if category and category.lower() != "all":
        products = [
            p for p in products
            if p["category"].lower() == category.lower()
        ]

    if search:
        query = search.strip().lower()
        products = [
            p for p in products
            if query in p["name"].lower()
            or query in p["brand"].lower()
            or query in p["category"].lower()
        ]

    return {
        "success": True,
        "count": len(products),
        "products": products,
    }


@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    product = next(
        (p for p in PRODUCTS if p["id"] == product_id),
        None,
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "success": True,
        "product": product,
    }


@app.get("/api/products/{product_id}/emi")
async def get_emi(product_id: str, variant_id: Optional[str] = None):
    product = next(
        (p for p in PRODUCTS if p["id"] == product_id),
        None,
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    variant = product["variants"][0]
    if variant_id:
        variant = next(
            (v for v in product["variants"] if v["id"] == variant_id),
            None,
        )
        if not variant:
            raise HTTPException(status_code=404, detail="Variant not found")

    plans = []
    for plan in product["emi_plans"]:
        principal = variant["price"]
        months = plan["months"]
        interest_rate = plan["interest_rate"]
        processing_fee = plan["processing_fee"]

        # Simple mock EMI calculation suitable for a frontend assignment.
        if interest_rate == 0:
            monthly = round(principal / months)
        else:
            monthly_rate = interest_rate / 100 / 12
            monthly = round(
                principal
                * monthly_rate
                * (1 + monthly_rate) ** months
                / ((1 + monthly_rate) ** months - 1)
            )

        plans.append({
            **plan,
            "monthly_amount": monthly,
            "total_amount": monthly * months + processing_fee,
        })

    return {
        "success": True,
        "product_id": product_id,
        "variant_id": variant["id"],
        "variant_price": variant["price"],
        "plans": plans,
    }
