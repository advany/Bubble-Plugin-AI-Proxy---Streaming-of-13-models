function(instance, properties, context) {
    
      if(!instance?.data?.json_params?.functions) instance.data.json_params.functions = []

      try {
          let jsonObject = JSON.parse(properties.function);  // Convert string to JSON object
          instance.data.json_params.functions.push(jsonObject);  // Add JSON object to array
        } catch (error) {
          console.error("Error parsing JSON string: ", error);   // Handle the error if the string is not a valid JSON
          instance?.publishState("error", "Add Functions Error : " + error.message)
          instance.triggerEvent("error");
        }

	  instance.data.functions.publish()
      
      instance.triggerEvent('function_added')
}