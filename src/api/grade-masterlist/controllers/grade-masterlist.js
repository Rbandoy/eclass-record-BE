'use strict';

/**
 * grade-masterlist controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios'); // You can use node-fetch as an alternative
 
module.exports = createCoreController('api::grade-masterlist.grade-masterlist', ({ strapi }) => ({

  // Override the default 'create' method with upsert and duplicate deletion logic
  async create(ctx) {
    const sendSms = async (mobileNo, message) => {

      if (mobileNo == "") return

      try { 
        axios.post(`https://api.semaphore.co/api/v4/messages?apikey=616d08668be5f09dead2b65f8ff943de&number=${mobileNo}&message=${message}&sendername`);
        console.log("message sent")
      } catch (error) {
        console.log("error sending sms", error)
      }
    }
    try {
      // Log the incoming request body
      // console.log(ctx.request.body);

      // Retrieve the request data
      const data = ctx.request.body.data;
      const sendTelegramMessage = async () => {
        try {
         
          const studentData = await strapi.entityService.findMany('api::student.student', {
            filters: { student_id: { $eq: data.student_id } }, // Assuming 'code' is the identifier
          });
          console.log('student',studentData)
          if (studentData[0]?.mobile != "") {
            sendSms(studentData[0].mobile, `Hi ${studentData[0].fname} Grades for ${data.subject_no}: ${data.description} is now available. 


              \n\nRemarks: ${data.remarks}\n


              Final Grade: ${data.final}
              `)
          }
          // const studentTelegram = studentData[0]?.telegram;
          // const chatParticipants = await axios.get(`https://api.telegram.org/bot7932055624:AAE_zqdyp2w45F8ELaeY1vx6FoVCY85W_2c/getUpdates`)

          // console.log(JSON.stringify(chatParticipants.data.result))
          // for (const item of chatParticipants.data.result) {
            // const participantUsername = item.message.chat.username; // The Telegram username from chatParticipants
          // chatParticipants.data.result.forEach(async (participant) => {
              // const username = participant.message.chat.username;
              // const chatId = participant.message.chat.id;
              
              // console.log(`Username: ${username}, Chat ID: ${chatId}`);

              // try {
              //   console.log('Match found:', studentTelegram, studentTelegram);
              //   if (studentTelegram != username) return
              //   // Send the message to the matched participant using the chat ID
              //   const response = await axios.post(
              //     `https://api.telegram.org/bot7932055624:AAE_zqdyp2w45F8ELaeY1vx6FoVCY85W_2c/sendMessage`,
              //     {
              //       chat_id: chatId, // Use the correct chat ID from the matched participant
              //       text: `Hi ${studentData[0].fname} Grades for ${data.subject_no}: ${data.description} is now available. Remarks: ${data.remarks}`,
              //     }
              //   );
        
              //   console.log('Message sent to Telegram:', response.data);
              // } catch (error) {
              //   // console.error('Error sending message to Telegram:', error);
              // }
          // }); 
          //   // Check if the student's Telegram username matches the participant's username
          //   if (studentTelegram === participantUsername && studentTelegram != undefined) {
          //   }
          // }
          
        } catch (error) {
          console.error('Error sending message', error);
        }
      };

      sendTelegramMessage()
      // Function to check if a grade entry exists in the grade-masterlist based on both subject_no and student_id
      const checkGradeMasterlistExists = async (subjectNo, semester, year, studentId) => {
        // console.log(subjectNo, semester, year, studentId)
        return await strapi.entityService.findMany('api::grade-masterlist.grade-masterlist', {
          filters: {
            subject_no: { $eq: subjectNo },
            student_id: { $eq: studentId },
            semester: { $eq: semester },
            sy: { $eq: year },
          },
        });
      };

      // Function to check if a subject exists based on subject_no
      const checkSubjectExists = async (subjectNo) => {
        const subjectData = await strapi.entityService.findMany('api::subject.subject', {
          filters: { code: { $eq: subjectNo } }, // Assuming 'code' is the identifier
        });
        return subjectData.length > 0; // Return true if subject exists
      };

      // Function to delete duplicates based on subject_no and student_id
      const deleteDuplicates = async (subjectNo, semester, year, studentId) => {
        const existingEntries = await checkGradeMasterlistExists(subjectNo, semester, year, studentId);
        // console.log("exists entry", existingEntries)
        if (existingEntries.length > 1) {
          // If there are duplicates, keep the first and delete the rest
          for (let i = 1; i < existingEntries.length; i++) {
            await strapi.entityService.delete('api::grade-masterlist.grade-masterlist', existingEntries[i].id);
          }
        }
        // Return the entry to keep
        return existingEntries[0];
      };

      // Upsert the grade-masterlist entry (update if exists, create if not)
      const upsertGradeMasterlist = async (entryData) => {
        const subjectExists = await checkSubjectExists(entryData.subject_no); // Check if subject exists
        // console.log(entryData)
        if (!subjectExists) {
          ctx.throw(400, `Subject with code ${entryData.subject_no} does not exist.`);
        }

        let existingEntry = await checkGradeMasterlistExists(entryData.subject_no, entryData.semester, entryData.sy,  entryData.student_id);
        // console.log("duplicate", existingEntry)
        if (existingEntry.length > 0) {
          // Delete any duplicates and return the one entry to update
          await deleteDuplicates(entryData.subject_no, entryData.semester, entryData.sy, entryData.student_id);
          existingEntry = await checkGradeMasterlistExists(entryData.subject_no, entryData.semester, entryData.sy, entryData.student_id);

          // Update the existing entry
          return await strapi.entityService.update('api::grade-masterlist.grade-masterlist', existingEntry[0].id, {
            data: entryData,
          });
        } else {
          // Create a new entry if none exists
          return await strapi.entityService.create('api::grade-masterlist.grade-masterlist', {
            data: entryData,
          });
        }
      };

      // Handle both single and array input
      if (typeof data === "object" && !Array.isArray(data)) {
        // For single entry
        const result = await upsertGradeMasterlist(data);
        return result; // Return the upserted entry
      } else if (Array.isArray(data)) {
        // For multiple entries
        const upsertedEntries = [];
// console.log(data) 
        for (const element of data) {
          
          const result = await upsertGradeMasterlist(element);
          upsertedEntries.push(result);
        }

        return upsertedEntries; // Return all upserted entries
      } else {
        ctx.throw(400, 'Invalid data format');
      }
    } catch (error) {
      console.error('Error in grade-masterlist upsert method:', error);
      ctx.throw(500, 'Internal server error');
    }
  }
}));
