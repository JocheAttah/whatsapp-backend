import mongoose from "mongoose";

// we'll defin our data schema.. how the data would be built

const whatsappSchema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  received: Boolean,
});

// setup collection messageContent
export default mongoose.model("messagecontent", whatsappSchema);
