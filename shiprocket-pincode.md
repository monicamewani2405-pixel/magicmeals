# Real delivery estimates from Shiprocket (PIN code checker)

The "Check" box on every product page asks `/api/pincode` (`api/pincode.js`), which asks Shiprocket which of your couriers
(Delhivery, Blue Dart, ...) can deliver from your pickup PIN to the customer's PIN, and how fast.
Until the three settings below exist, the box shows the zone estimate from `pincode.js` instead (so nothing breaks).

## Set it up (about 10 minutes)

1. **Create a Shiprocket API user** (do not use your main login; Shiprocket's API does not work with OTP login):
   Shiprocket > Settings > API > Configure > **Create an API User**. Use a different email from your main account
   (a Gmail "+" address such as `yourname+api@gmail.com` works) and choose a password.
2. **Make sure your pickup address is saved** in Shiprocket (Settings > Pickup Addresses) and that Delhivery / Blue Dart
   are switched on (Settings > Courier).
3. **Add three settings in Vercel**: Project > Settings > Environment Variables (tick Production, Preview and Development):

   | Name | Value |
   |---|---|
   | `SHIPROCKET_EMAIL` | the API user's email |
   | `SHIPROCKET_PASSWORD` | the API user's password |
   | `PICKUP_PINCODE` | `400080` (Mulund West, Mumbai; change if you ship from somewhere else) |

4. **Redeploy** (Deployments > the latest one > Redeploy). Settings only apply to new deployments.
5. **Test**: open `https://<your-site>/api/pincode?pin=500001`. You should see something like
   `{"ok":true,"serviceable":true,"minDays":2,"maxDays":3,"etd":"..."}`.
   `{"ok":false,"error":"not_configured"}` means a setting is missing or the site was not redeployed.
   `{"ok":false,"error":"upstream"}` means Shiprocket refused the login or did not answer (check the email / password; the Vercel
   function log shows the reason, never the password).

Never put the password in the code, in chat, or in a screenshot. It only lives in Vercel.

## What customers see

- Serviceable: "Estimated delivery to Hyderabad: 2 to 3 days after dispatch." (fastest courier to the third fastest)
- Not served by any courier: "Sorry, our delivery partners do not deliver to this PIN code yet."
- Shiprocket slow, down or not set up: the zone estimate ("2 to 4 working days"), after at most 5 seconds.

Answers are cached for 6 hours per PIN, and the function stops asking Shiprocket after 60 new PIN codes a minute.

## Notes

- Shiprocket's days count from pickup; the page says "after dispatch". The product page also says orders ship within 24 hours.
- Cash on delivery is not shown: Shiprocket reports it per courier, but whether the Shopify checkout offers it is a separate setting.
- To use Delhivery directly instead, only `api/pincode.js` changes (their pincode + expected-TAT APIs take a Delhivery token).
