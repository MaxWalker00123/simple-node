const express = require("express");
const fetch = require("node-fetch"); // Ensure node-fetch is installed
const app = express();
const PORT = 3000; // Replace with your desired port

// Middleware to parse JSON request body
app.use(express.json());

// Function from your script
const redeemVoucher = async (e = "", t = "") => {
  if (!(e = (e + "").trim()).length || e.match(/\D/)) {
    throw Error("INVALID_PHONE");
  }

  let r = (t += "").split("v=");
  if (35 !== (t = (r[1] || r[0]).match(/[0-9A-Za-z]+/)[0]).length) {
    throw Error("INVALID_VOUCHER");
  }

  let o = await fetch(`https://gift.truemoney.com/campaign/vouchers/${t}/redeem`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mobile: e, voucher_hash: t }),
  }).then((e) => e.json());

  if ("SUCCESS" === o.status.code) {
    return {
      amount: Number(o.data.my_ticket.amount_baht.replace(/,/g, "")),
      owner_full_name: o.data.owner_profile.full_name,
      code: t,
    };
  }

  throw Error(o.status.code);
};

// API endpoint
app.post("/redeem", async (req, res) => {
  const { phone, voucher } = req.body;

  try {
    const result = await redeemVoucher(phone, voucher);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
