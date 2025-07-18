import { Webhook } from "svix";
import User from "../models/User.js";

// API controller to manage clerk user with the database
// export const clerkWebhooks = async (req, res) => {
//   try {
//     // Create svix instance with Clerk webhook secret
//     const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

//     // Verifying headers
//     await whook.verify(JSON.stringify(req.body), {
//       "svix-id": req.headers["svix-id"],
//       "svix-timestamp": req.headers["svix-timestamp"],
//       "svix-signature": req.headers["svix-signature"],
//     });

//     // Handle user creation event //to be tested
//     if (evt.type === 'user.created') {
//       const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      
//       await User.create({
//           _id: id,
//           name: `${first_name} ${last_name}`,
//           email: email_addresses[0].email_address,
//           image: image_url,
//           resume: ''
//       });
//   }

//     // Getting data from request body
//     const { data, type } = req.body;

//     // Log incoming data for debugging
//     console.log("Webhook Event Type:", type);
//     console.log("Webhook Data:", data);

//     // Switch case for different events
//     switch (type) {
//       case "user.created": {
//         const userData = {
//           _id: data.id,
//           email: data.email_addresses[0].email_address, // Correct field
//           name: data.first_name + " " + data.last_name,
//           image: data.image_url,
//           resume: "",
//         };
//         await User.create(userData);
//         res.json({});
//         break;
//       }
//       case "user.updated": {
//         const userData = {
//           email: data.email_addresses[0].email_address, // Correct field
//           name: data.first_name + " " + data.last_name,
//           image: data.image_url,
//         };
//         await User.findOneAndUpdate({ _id: data.id }, userData); // Correct query
//         res.json({});
//         break;
//       }
//       case "user.deleted": {
//         await User.findByIdAndDelete(data.id);
//         res.json({});
//         break;
//       }
//       default:
//         break;
//     }
//   } catch (error) {
//     console.log("Error processing webhook:", error.message);
//     res.json({ success: false, message: "Webhooks Error" });
//   }
// };

//exp..


export const handleClerkWebhook = async (req, res) => {
  const payload = req.body;
  const headers = {
    "svix-id": req.headers["svix-id"],
    "svix-timestamp": req.headers["svix-timestamp"],
    "svix-signature": req.headers["svix-signature"]
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  try {
    // Verify webhook signature
    const evt = wh.verify(JSON.stringify(payload), headers);

    // Handle different event types
    switch (evt.type) {
      case "user.created": {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        
        // Validate required fields
        if (!id || !email_addresses?.[0]?.email_address) {
          throw new Error('Missing required fields for user creation');
        }

        // Create user with fallback values
        const userData = {
          _id: id,
          name: `${first_name || ''} ${last_name || ''}`.trim() || "New User",
          email: email_addresses[0].email_address,
          image: image_url || "/default-avatar.png",
          resume: ""
        };

        // Check if user already exists
        const existingUser = await User.findById(id);
        if (existingUser) {
          console.log(`User already exists: ${id}`);
          return res.status(200).json({ success: true });
        }

        // Create new user
        await User.create(userData);
        console.log(`Created user: ${id}`);
        break;
      }

      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        
        if (!id) {
          throw new Error('Missing user ID for update');
        }

        await User.findOneAndUpdate(
          { _id: id },
          {
            name: `${first_name || ''} ${last_name || ''}`.trim() || "New User",
            email: email_addresses[0].email_address,
            image: image_url || "/default-avatar.png"
          },
          { new: true, upsert: true } // Create if doesn't exist
        );
        console.log(`Updated user: ${id}`);
        break;
      }

      case "user.deleted": {
        const { id } = evt.data;
        if (!id) {
          throw new Error('Missing user ID for deletion');
        }
        await User.findByIdAndDelete(id);
        console.log(`Deleted user: ${id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${evt.type}`);
        return res.status(400).json({ success: false, message: 'Unhandled event type' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.status(400).json({
      success: false,
      message: `Webhook Error: ${error.message}`,
      errorDetails: error
    });
  }
};