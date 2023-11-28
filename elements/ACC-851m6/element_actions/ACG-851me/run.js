function(instance, properties, context) {
  try {
    var messages = JSON.parse(properties.messages)
    instance.data.json_params.messages = messages;
    console.log('AI PROXY: reset message history to passed values ' + properties.messages)
  } catch (e) {
    console.log('AI PROXY: Error in reset_messages with : ' + e.message);
    instance?.publishState("error", "Reset Messages Error : " + e.message)
    instance.triggerEvent("error");
  }

  if (!properties.messages) {
    instance.data.json_params.messages = instance?.data?.initial_json_params?.messages;
    console.log("AI PROXY: reset message history to initial values: " + JSON.stringify(instance?.data?.initial_json_params?.messages));
  }

  instance.data.functions.publish()
    
  instance.triggerEvent("messages_reset");
}