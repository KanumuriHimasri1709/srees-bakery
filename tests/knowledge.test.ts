import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Sree's Home Bakery Verified Data Integrity", () => {
  const dataDir = path.resolve(__dirname, "../data");

  it("ensures business_info.json has verified contact details", () => {
    const raw = fs.readFileSync(path.join(dataDir, "business_info.json"), "utf-8");
    const data = JSON.parse(raw);
    assert.strictEqual(data.name, "Sree’s Home Bakery");
    assert.ok(data.phones.includes("7981468535"));
    assert.ok(data.phones.includes("8801121818"));
    assert.strictEqual(data.hours, "9:00 AM – 9:00 PM");
    assert.ok(data.cake_orders.includes("1 day before"));
  });

  it("ensures delivery.json specifies Rapido and customer-paid charges", () => {
    const raw = fs.readFileSync(path.join(dataDir, "delivery.json"), "utf-8");
    const data = JSON.parse(raw);
    assert.strictEqual(data.available, true);
    assert.strictEqual(data.method, "Rapido");
    assert.ok(data.charges.toLowerCase().includes("paid by the customer"));
  });

  it("ensures menu_verified.txt contains all core cakes and prices", () => {
    const text = fs.readFileSync(path.join(dataDir, "menu_verified.txt"), "utf-8");
    assert.ok(text.includes("Vanilla: ½ kg ₹300"));
    assert.ok(text.includes("Chocolate: ½ kg ₹400"));
    assert.ok(text.includes("Red Velvet"));
    assert.ok(text.includes("Only Millet Cookies are explicitly confirmed"));
    assert.ok(text.includes("PhonePe"));
  });

  it("ensures offers.json specifies 10% first order offer via Instagram", () => {
    const raw = fs.readFileSync(path.join(dataDir, "offers.json"), "utf-8");
    const data = JSON.parse(raw);
    assert.ok(data.first_order.includes("10% OFF"));
    assert.ok(data.first_order.includes("Instagram"));
  });
});
