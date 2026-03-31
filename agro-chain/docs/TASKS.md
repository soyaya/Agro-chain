# Tasks

## Corrections
+ Login: Just email
+ otp to verify the email, 6 digits
+ Correct the cluster farmer&apos;s listings to not submit again altogether, it fetches from an endpoint of the listing from each farmers under him, append approve or reject status then submit it.

## Implementations


Buyers in this system can place orders

Buyers -> Place order -> Make payments: When making payments, they'll choose either for it to be delivered to them and in what state, processed or not.
Buyers should now have a tracking page where they can track the status of their orders.
Payments will have to be the delivery fee + amount for fish if a choice for it to be delivered to them is chosen, or
just the amount of the fish if they choose to pick it up themselves

When a cluster farmer choose to accept the order, the buyer gets information about its cluster farmer if they did not choose location delivery
Now there have to be a state for that, if deliver, logistics manager's information / driver but ultimately, they should just have the cluster farmers information

The customer should be able to say yes, also they've received their delivery in good condition and no loss, and satisfied and only thn will the farmer be paid 24 hours later. immediately the cluster farmer and the buyer accepts that they are done, there'll be a dropdown of a countdown from seconds, to minues to hours for the next 24 hours like a timeout before the farmers payments will be processed

the dropdown can use an AnimatePresence to slide beautifully



On the cluster farmer&apos; side of things, there now has to be an order part of things where the cluster farmer sees the orders that has been made, choose to accept to process the order,
process the order, make the delivery and send the status for delivery as done
the options are dried fish, jumbo, table size and broodstock and the buyer can choose the state of the fish they want, processed or not, and the cluster farmer can choose to accept or reject the order based on the state of the fish they have available and the buyer&apos;s choice .


in the marketplace, its saying added to market place but we should be seeing a cart button thats increasing based on the individual product that is being added to the marketplace, and then when we click on the cart button, it should show us the items in the cart and a checkout button that takes us to the checkout page where we can make payments for the items in the cart.
we dont have order page for the cluster farmer, we just have the listing page, so we can add a new page for orders where they can see the orders that has been made and choose to accept or reject the order based on the state of the fish they have available and the buyer's choice.

when all is said and done, we should have a page for the cluster farmer to see the orders that has been made and choose to accept or reject the order based on the state of the fish they have available and the buyer's choice, and a page for the buyer to track their orders and make payments for their orders.

when all is said and done, we would now edit the endpoints for the farmer, and cluster farmer to include the new endpoints for orders and payments, and also edit the endpoints for the marketplace to include the new endpoints for the cart and checkout.

any change thats been made to the endpoints should be reflected in the documentation and also in the codebase, so that we can keep track of the changes that has been made and also to avoid confusion in the future when we need to refer back to the documentation for any reason.

what else, give me your thoughts and how you intend to execute this, and also if you have any questions or concerns about the tasks that has been outlined here, feel free to ask and we can discuss it further.

read through the codebase and the documentation to get a better understanding of how things are currently set up and how we can implement the new features that has been outlined here, and also to see if there are any existing code that we can reuse or if we need to write new code for the new features.
make accessibility and responsiveness a priority when implementing the new features, so that we can ensure that the application is usable by everyone regardless of their device or accessibility needs.

another thing is the farmers already know the pricing, there's no need to display the price of the fish in the listing but we can display the price of the fish to the buyers. i want an exported base price per kg of 3,500 Naira and thats what we'll use to price per kg of the fish

whats your plan to implement this as a pro, let me hear them and if you have any questions, ask before implementation, and also if you have any concerns about the tasks that has been outlined here, feel free to ask and we can discuss it further.





