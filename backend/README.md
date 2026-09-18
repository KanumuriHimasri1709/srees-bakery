# Sree's Home Bakery - Backend API

FastAPI-powered backend providing REST endpoints for:
- Bakery information and menu retrieval
- RAG-powered chatbot with grounded bakery knowledge
- Order and custom cake enquiry submission
- Customer reference image upload for custom cake orders

## Architecture Overview

```
backend/
├── app/
│   ├── main.py          # FastAPI app initialization, CORS, static uploads
│   ├── routes/          # REST route handlers
│   │   ├── bakery.py    # /api/bakery/* endpoints
│   │   ├── chat.py      # /api/chat RAG assistant endpoint
│   │   ├── enquiries.py # /api/enquiries/* order endpoints
│   │   └── upload.py    # /api/upload-reference endpoint
│   ├── services/        # Business logic & RAG integration
│   │   ├── data_service.py
│   │   ├── rag_service.py
│   │   └── enquiry_service.py
│   ├── models/          # Schemas & SQLite database models
│   │   ├── schemas.py
│   │   └── database.py
│   └── utils/           # Validation helpers
│       └── file_validation.py
├── requirements.txt
└── README.md
```

## Running the Backend

```bash
# From the project root
python run.py backend
# Or directly with uvicorn:
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

- `GET /api/bakery/info`: Business contact, location, hours, and policies.
- `GET /api/bakery/menu`: Full product list with verified pricing.
- `GET /api/bakery/delivery`: Delivery options and policies.
- `GET /api/bakery/faqs`: Frequently asked questions and answers.
- `GET /api/bakery/offers`: Current promotional discounts.
- `POST /api/chat`: Chat with Sree's Bakery Assistant (RAG).
- `POST /api/enquiries/order`: Submit standard menu order enquiry.
- `POST /api/enquiries/custom-cake`: Submit custom cake enquiry.
- `POST /api/upload-reference`: Upload JPG/PNG/WEBP custom cake reference image (saved to `uploads/custom_cake_references/`).
