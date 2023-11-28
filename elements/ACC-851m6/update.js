function(instance, properties, context) {
  var api_host = instance.data.custom_ai_proxy || "ai-proxy.nocodesaastoolbox.com";
  var api_path;
  var model;

  switch (properties.ai_service) {
    case "openai":
      api_path = "/v1/chat/completions";
      model = properties.openai_model;
      break;
    case "openrouter":
      api_path = "/api/v1/chat/completions";
      model = properties.openrouter_model;
      break;
  }
    
  if(properties.custom_model_name) model = properties.custom_model_name

  instance.data.final_ai_url = `https://${api_host}/ai/${properties.ai_service}${api_path}?client_id=${context.keys.CLIENT_ID}&referer=${encodeURIComponent(window.location.href)}&title=${window.location.hostname}`;

  if (properties.custom_ai_proxy) instance.data.custom_ai_proxy = properties.custom_ai_proxy;

  if (!instance.data.json_params) instance.data.json_params = {};

  if (!instance.data.model) instance.data.json_params.model = model;

  if (!instance.data.json_params.message) instance.data.json_params.messages = [];

  if (properties.system)
    instance.data.json_params.messages[0] = {
      role: "system",
      content: properties.system,
    };

  if (!instance.data.initial_json_params)
    instance.data.initial_json_params = {
      model: properties.model,
      messages: [
        {
          role: "system",
          content: properties.system,
        },
      ],
    };

  instance.data.functions = {};
    
  instance.data.prefix_messages = properties.prefix_messages;
  instance.data.include_system_message = properties.include_system_message;
  instance.data.include_assistent_messages = properties.include_assistent_messages;
  instance.data.include_user_messages = properties.include_user_messages;
  instance.data.include_function_call_messages = properties.include_function_call_messages
  instance.data.include_function_result_messages = properties.include_function_result_messages;
    
  instance.data.functions.publish = function publish_messages() {
    instance?.publishState("json_params", JSON.stringify(instance.data.json_params));

    instance?.publishState(
      "messages",
      instance.data.json_params.messages
        .filter((message) => {
          if (!instance.data.include_system_message && message.role === "system") {
		    console.log("AI PROXY: excluding message for " + message.role + " : " + message.content);
            return false;
          }
          if (!instance.data.include_assistent_messages && message.role === "assistant") {
    		console.log("AI PROXY: excluding message for " + message.role + " : " + message.content);
            return false;
          }
          if (!instance.data.include_user_messages && message.role === "user") {
    		console.log("AI PROXY: excluding message for " + message.role + " : " + message.content);
            return false;
          }
    	  if (!instance.data.include_function_call_messages && message.function_call) {
    		console.log("AI PROXY: excluding message for " + message.role + " : " + JSON.stringify(message.function_call));
            return false;
          }
          if (!instance.data.include_function_result_messages && message.role === "function") {
    		console.log("AI PROXY: excluding message for " + message.role + " : " + message.content);
            return false;
          }
          return true;
        })
        .map((message) => {
    		if(message.function_call) {
				if(message.function_call.name) instance?.publishState("function_call_name", message.function_call.name);
    			try {
    				if(message.function_call.arguments) {
    					var arguments = JSON.parse(message.function_call.arguments)
    					if(arguments) instance?.publishState("function_call_argument_names", Object.keys(arguments));
    					if(arguments) instance?.publishState("function_call_argument_values", Object.values(arguments).map((argument) => (argument ? argument.toString(): "")));
  					}
  				} catch(error) {
				}
				return (instance.data.prefix_messages ? "function_call : " + JSON.stringify(message.function_call) : JSON.stringify(message.function_call))
  			} else if(message.content) return (instance.data.prefix_messages ? message.role + ": " + message.content : message.content)
  		})
    );
  };

  instance.data.functions.publish();
}