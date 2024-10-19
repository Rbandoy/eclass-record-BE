import axios from 'axios';

const sendSms = async (mobileNo, message) => {
  try { 
    axios.post(`https://api.semaphore.co/api/v4/messages?apikey=8e9c48fc63c1e60af9c024905e22ecea&number=${mobileNo}&message=${message}&sendername`);
    console.log("message sent")
  } catch (error) {
    console.log("error sending sms", error)
  }
}

export default sendSms;