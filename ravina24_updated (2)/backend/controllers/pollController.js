import Poll from '../models/Poll.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getPoll = async (req, res) => {
  try {
    let poll = await Poll.findOne();

    if (!poll) {
      poll = await Poll.create({
        question: 'Which frontend technology do you like?',
        options: [
          { option: 'React', votes: 12 },
          { option: 'Angular', votes: 7 },
          { option: 'Vue', votes: 5 },
        ],
      });
    }

    return sendSuccess(res, 200, 'Poll fetched successfully.', {
      poll,
    });
  } catch (error) {
    return sendError(res, 500, 'Unable to load poll data.');
  }
};

export const votePoll = async (req, res) => {
  try {
    const { option } = req.body;
    const poll = await Poll.findOne();

    if (!poll) {
      return sendError(res, 404, 'Poll not found.');
    }

    const selectedOption = poll.options.find((item) => item.option === option);
    if (!selectedOption) {
      return sendError(res, 400, 'Please select a valid option.');
    }

    selectedOption.votes += 1;
    await poll.save();

    return sendSuccess(res, 200, `Vote submitted for ${option}.`, {
      poll,
    });
  } catch (error) {
    return sendError(res, 500, 'Unable to submit vote.');
  }
};
