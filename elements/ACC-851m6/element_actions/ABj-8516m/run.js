function(instance, properties, context) {
  if(!context.keys.CLIENT_ID) {
      instance.publishState('error', "CLIENT_ID is empty");
      return;
  }
    
  if(!properties.token) {
      instance.publishState('error', "Token is empty");
      return;
  }

  if (instance.data.n === undefined) {
	instance.data.n = 0;
  }
    const fetch_data = async (cb) => {
        try {
            await requestAI();
            cb(null, '');
        } catch (e) {
            cb(e);
        }
    };

    fetch_data.toString = () => {
        return instance.data.n;
    };

    const value = context.async(fetch_data);

    instance.data.n++;

	async function requestAI() {
        instance.publishState('content', '');
	    instance.publishState('error', '');
        
        try {

			console.log(instance.data.final_ai_url)

            var source = new SSE(instance.data.final_ai_url, {headers: {'Content-Type': 'text/plain'}, payload: properties.token});
            instance.data.request = source;
            
            // reset all values
            instance.data.generated_content = ""
            instance.data.generated_function_call = {}
            instance.publishState('content', "");
            
            instance.publishState('generated_content', false);
            instance.publishState('generated_function', false);
            
            
            instance.data.new_message = {
                      "role": "assistant",
                      "content": instance.data.generated_content
                    }

            instance?.data?.json_params?.messages?.push(instance.data.new_message)
            instance.publishState('error', '');
            instance.publishState('streaming', true);
            
            source.addEventListener('message', function(e) {
              var contentType = e?.source?.xhr?.getResponseHeader('content-type')

              if (contentType && contentType.includes('application/json') && e?.source?.xhr?.response) {
              	
                try {
              
              	  var jsonResponse = JSON.parse(e.source.xhr.response)
                  if(jsonResponse.error) {
              		instance.publishState('error', jsonResponse.error);
                    instance.publishState('error_status_code', jsonResponse.error_status_code);
              		instance.publishState('error_status_text', jsonResponse.error_status_text);
                    instance.publishState('streaming', false);
                    instance.triggerEvent('error')
              	  } else {
              		instance.publishState('content', e.source.xhr.response);
                    instance.publishState('streaming', false);
                    instance.triggerEvent('finished')
              	  }
              
                  return;
                } catch (err) {
              
                  console.error("Error parsing JSON:", err);
                  instance.publishState('error', 'Received invalid JSON data.');
                  instance.publishState('streaming', false);
              	  instance.triggerEvent('error')
                  return;
              
                }
              }
              
			  if(e.data != "x
	              var payload = JSON.parse(e.data);

                  if (payload?.choices && Array.isArray(payload.choices) && payload.choices.length > 0 && payload.choices[0].delta) {
            		var delta = payload.choices[0].delta;
            	    if(delta.content) {
	            		instance.data.new_message.content = instance.data.generated_content
            			instance.data.generated_content = instance.data.generated_content + delta?.content;
            			instance.publishState('content', instance.data.generated_content);
            
            			instance.data.functions.publish()
        			}
					if(delta.function_call) {
            			if(delta.function_call.name) instance.data.generated_function_call.name = (instance.data.generated_function_call.name ? instance.data.generated_function_call.name + delta.function_call.name : delta.function_call.name);
            			if(delta.function_call.arguments) instance.data.generated_function_call.arguments = (instance.data.generated_function_call.arguments ? instance.data.generated_function_call.arguments + delta.function_call.arguments : delta.function_call.arguments);
            			instance.data.new_message.function_call = instance.data.generated_function_call;
            
            			instance.publishState('function', JSON.stringify(instance.data.generated_function_call));

			            instance.data.functions.publish()
        			}
        		  }
                  
              } else if(e.data == " [DONE]") {
				if(instance.data.new_message.content) instance.publishState('generated_content', true);
	            if(instance.data.new_message.function_call) instance.publishState('generated_function', true);
                  
                instance?.publishState("json_params", JSON.stringify(instance.data.json_params));
                
			    instance.publishState('streaming', false);
                instance.triggerEvent('finished')
              }
              
            });
                      
            source.stream();
            
        } catch (error) {
              
            instance.publishState('error', JSON.stringify(error));
            instance.publishState('streaming', false);
            instance.triggerEvent('error')
            console.error("Error:", error);
              
        }
        
        return;
    }

}