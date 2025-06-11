  try {
    const postFormData = new FormData();
    postFormData.append('Title', formData.title);
    postFormData.append('Description', formData.description);
    postFormData.append('CompanyId', user.userId);

    if (selectedImage) {
      postFormData.append('ImageFile', selectedImage);
    }

    console.log('FormData contents:');
    for (let pair of postFormData.entries()) {
      console.log(pair[0]+ ': ' + pair[1]); 
    }

    const result = await ApiService.createJob(postFormData); // Call the correct API service function
    console.log("API gọi thành công", result);
  } catch (error) {
    console.error("API gọi thất bại", error);
  } 