function(instance, properties, context) {

  if(properties.name && properties.content) {
      instance?.data?.json_params?.messages?.push({
          "role": 'function',
          "name": properties.name,
          "content": properties.content
      })

	  instance.data.functions.publish()
      
      instance.triggerEvent('function_result_added')
  }
}