/* Basic integration test for payments endpoints (dev only)

Usage: run while server dev is running:

  node test/payments-test.js

This script assumes an existing user with a valid access token and an existing service request id.
Adjust ACCESS_TOKEN and REQUEST_ID below for your local run.
*/

const fetch = require('node-fetch');
const crypto = require('crypto');

const SERVER = process.env.SERVER || 'http://localhost:3000';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '<PUT_ACCESS_TOKEN_HERE>';
const REQUEST_ID = process.env.REQUEST_ID || '<PUT_REQUEST_ID_HERE>';
const IDEMPOTENCY_KEY = 'test-idem-' + Date.now();
const MOCK_SECRET = process.env.MOCK_GATEWAY_SECRET || 'mock_secret';

async function createOrder(){
  const res = await fetch(SERVER + '/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    },
    body: JSON.stringify({ requestId: REQUEST_ID, idempotencyKey: IDEMPOTENCY_KEY })
  });
  const j = await res.json();
  console.log('create-order', res.status, j);
  return j.data;
}

async function postWebhook(order){
  const payload = JSON.stringify({ order_id: order.orderId, payment_id: 'MOCKPAY_' + Date.now(), status: 'success' });
  const sig = crypto.createHmac('sha256', MOCK_SECRET).update(payload).digest('hex');
  const res = await fetch(SERVER + '/payments/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mock-signature': sig
    },
    body: payload
  });
  const j = await res.json();
  console.log('webhook', res.status, j);
}

(async ()=>{
  try{
    const order = await createOrder();
    if(order) await postWebhook(order);
  }catch(e){
    console.error(e);
  }
})();
