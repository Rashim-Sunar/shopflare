import { PayPalButtons } from "@paypal/react-paypal-js";

const PayPalButton = ({ amount, onSuccess, onError }) => {
  return (
    <PayPalButtons
      style={{ layout: "vertical" }}

      // Create PayPal order
      createOrder={(data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amount.toString(), // MUST be string
              },
            },
          ],
        });
      }}

      // IMPORTANT:
      // Since intent="capture" is used in PayPalScriptProvider,
      // PayPal AUTO-captures the order.
      // Calling capture() again causes a 422 error and breaks navigation.
      onApprove={(data, actions) => {
        return actions.order.get().then(onSuccess);
      }}

      // Handle errors
      onError={onError}
    />
  );
};

export default PayPalButton;
