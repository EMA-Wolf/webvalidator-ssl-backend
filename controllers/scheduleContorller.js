const { runCheckSite } = require("../utils/scheduleChecker");

let scheduledTasks = {};
let userScheduledSites = {};  // Add this line to store scheduled sites for each user

const scheduleWithTimeout = (req, res) => {
  const { sites, hours, minutes, userId } = req.body;
  const intervalMilliseconds = (parseInt(hours) * 60 + parseInt(minutes)) * 60 * 1000;
  console.log(`Scheduled scan began by Id: ${userId}`);
  console.log(`Sites: ${sites}`);

  // Store the sites in userScheduledSites keyed by userId
  userScheduledSites[userId] = sites;

  const task =  setInterval(async () => {
    const userSites = userScheduledSites[userId];
    console.log(`Running scheduled check for sites: ${userSites.map(site => site).join(', ')}`);
    try {
      await runCheckSite(userId, userSites);
    } catch (error) {
      console.error(`Error running scheduled check for sites`, error);
    } 
  }, intervalMilliseconds);

  scheduledTasks[userId] = task;

  console.log(`Scheduled with timeout successfully`);
  res.status(200).json({ message: 'Scheduled with timeout successfully' });
};


const stopScheduledTask = (req, res) => {
    const { userId } = req.body;
    console.log(`Userid ${userId} received for clearing scheduled task`);
  
    if (scheduledTasks[userId]) {
      clearInterval(scheduledTasks[userId]);
      delete scheduledTasks[userId];
      delete userScheduledSites[userId];
      console.log(`Stopped scheduled scan for user Id: ${userId}`);
      res.status(200).json({ message: 'Scheduled scan stopped successfully' });
    } else {
      res.status(200).json({ message: 'No scheduled scan found for this user' });
      console.log(`No scheduled scan found for user ${userId}`);
    }
  };
  
  module.exports = { scheduleWithTimeout, stopScheduledTask };
  
