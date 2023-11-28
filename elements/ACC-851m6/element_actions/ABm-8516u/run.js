function(instance, properties, context) {

  if(properties.role && properties.content) {
      instance?.data?.json_params?.messages?.push({
          "role": properties.role,
          "content": properties.content
      })

	  instance.data.functions.publish()
      
      instance.triggerEvent('message_added')
  }

}