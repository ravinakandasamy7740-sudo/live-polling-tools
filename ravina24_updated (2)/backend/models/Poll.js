import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema(
  {
    option: {
      type: String,
      required: true,
      trim: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      default: 'Which frontend technology do you like?',
    },
    options: {
      type: [optionSchema],
      default: [
        { option: 'React', votes: 12 },
        { option: 'Angular', votes: 7 },
        { option: 'Vue', votes: 5 },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Poll = mongoose.model('Poll', pollSchema);

export default Poll;
