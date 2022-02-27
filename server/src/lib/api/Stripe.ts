import stripe from "stripe";

const client = new stripe(`${process.env.S_SECRET_KEY}`, {
  typescript: true,
  apiVersion: "2020-08-27",
});

export const Stripe = {
  connect: async (code: string) => {
    const response = await client.oauth.token({
      code,
      grant_type: "authorization_code",
    });

    return response;
  },
  disconnect: async (stripeUserId: string) => {
    const response = await client.oauth.deauthorize({
      client_id: `${process.env.S_CLIENT_ID}`,
      stripe_user_id: stripeUserId,
    });
    return response;
  },
  charge: async ({
    amount,
    source,
    stripeAccount,
  }: {
    amount: number;
    source: string;
    stripeAccount: string;
  }) => {
    const response = await client.charges.create(
      {
        amount,
        currency: "usd",
        source,
        application_fee_amount: Math.round(amount * 0.05),
      },
      { stripeAccount }
    );

    if (response.status !== "succeeded") {
      throw new Error("failed to create charge with Stripe");
    }
  },
};
