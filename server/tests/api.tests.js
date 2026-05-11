const request = require("supertest");

const baseUrl = "http://shadowbox.dk";

describe("ShortCut API integration tests", () => {
  test("GET /api/products should return products", async () => {
    const res = await request(baseUrl)
      .get("/api/products")
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/auth/login should login admin", async () => {
    const res = await request(baseUrl)
      .post("/api/auth/login")
      .send({
        email: "admin@coffeetimer.local",
        password: "admin123"
      })
      .expect(200);

    expect(res.body).toBeDefined();
  });

  test("POST /api/bookings should create booking", async () => {
    const res = await request(baseUrl)
      .post("/api/bookings")
      .send({
        barberId: "zana",
        serviceId: "hair",
        startISO: "2026-07-01T10:00:00Z",
        customerName: "Test Kunde",
        customerPhone: "12345678"
      })
      .expect(201);

    expect(res.body).toBeDefined();
  });

  test("Cart flow: get cart, add item, remove item", async () => {
    const guestToken = "76caf4fc-fb59-47d9-a16b-ee8c07b7698f";

    const cartBefore = await request(baseUrl)
      .get("/api/cart")
      .set("x-guest-token", guestToken)
      .expect(200);

    expect(cartBefore.body).toBeDefined();

    const addRes = await request(baseUrl)
      .post("/api/cart/items")
      .set("x-guest-token", guestToken)
      .send({
        productId: "a6030fa1-34c7-4190-ab93-a1b4fd1b9faa",
        quantity: 1
      })
      .expect(201);

    expect(addRes.body).toBeDefined();

    const cartItemId = addRes.body.id || addRes.body.cart_item_id;

    if (cartItemId) {
      await request(baseUrl)
        .delete(`/api/cart/items/${cartItemId}`)
        .set("x-guest-token", guestToken)
        .expect(200);
    }
  });
});