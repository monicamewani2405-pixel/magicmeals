# Custom box (BYOB) discount codes: Shopify setup

The site applies the box discount at checkout with a Shopify discount code, so the price in the cart and the price in Shopify match.
Customers never type these codes: the site adds the right one automatically. Create all three in **My Store 2** (`1z10zd-y0.myshopify.com`).

| Code | Box | Discount | Minimum quantity |
|---|---|---|---|
| `BYOB2` | 2 meals | 5 % | 2 items |
| `BYOB4` | 4 meals | 10 % | 4 items |
| `BYOB6` | 6 meals | 15 % | 6 items |

## Steps (repeat for each row)

1. Shopify admin > **Discounts** > **Create discount** > **Amount off order** (not "Amount off products": that type forces you to pick collections or products).
2. **Method:** Discount code. **Code:** exactly as in the table (capital letters, no spaces). **Title** can be the same.
3. **Value:** Percentage, and the percentage from the table.
4. **Minimum purchase requirements:** *Minimum quantity of items*, and the number from the table.
5. **Customer eligibility:** All customers.
6. **Maximum discount uses:** leave everything unticked (no limits).
7. **Combinations:** leave everything unticked.
8. **Active dates:** start today, no end date.
9. **Save discount.** Check the status says *Active*.

## After creating the three codes

Tell Claude "codes are done". It will run a real box checkout test against the live store (a Shopify cart only, never an order) and confirm the total matches the site.

## Things to know

- The code discounts the **whole cart**. A box checked out together with loose pouches or packs would also discount those, so the totals would differ and the site stops checkout instead of charging a price the customer was not shown. For now a box has to be checked out on its own.
- If you change a code name, change it in `shopify-config.js` (`byobDiscountCodes`) too.
- The percentages must match the site: 2 meals 5 %, 4 meals 10 %, 6 meals 15 % (`main.js`, BYOB "Add Complete Box to Cart").
