'use strict';

import mongoose from 'mongoose';
import HttpError from 'http-errors';
import Profile from './profile';

const plantSchema = mongoose.Schema({
  plantNickname: {
    type: String,
  },
  commonName: {
    type: String,
    required: true,
  },
  scientificName: {
    type: String,
  },
  groupType: {
    type: String,
  },
  placement: {
    type: String,
    required: true,
  },
  createdOn: { 
    type: Date,
    // required: true,
    default: () => new Date(),
  },
  lastWaterDate: {
    type: Date,
    default: () => new Date(),
  },
  waterInterval: {
    type: Number,
    default: 3,
  },
  nextWaterDate: {// .pre before saving water schedule calculate the date intervals
    type: Date,
  },
  fertilizerDate: {
    type: Number,
  },
  mistingDate: {
    type: Number,
  },
  plantJournal: {
    type: Number,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profile',
    required: true,
  },
});


function plantPreHook(done) {
  return Profile.findById(this.profile)
    .then((profileFound) => {
      if (!profileFound) {
        throw new HttpError(404, 'Profile not found.');
      }
      profileFound.planterBox.push(this._id);
      return profileFound.save();
    })
    .then(() => done());
}

const plantPostHook = (document, done) => {
  return Profile.findById(document.profile)
    .then((profileFound) => {
      if (!profileFound) {
        throw new HttpError(500, 'Profile not found in post hook.');
      }
      profileFound.posts = profileFound.profiles.filter((profile) => {
        return profile._id.toString() !== document._id.toString();
      });
    })
    .then(() => done())
    .catch(done); // same as .catch(result => done(result))
};

plantSchema.pre('save', plantPreHook);
plantSchema.post('remove', plantPostHook);

export default mongoose.model('plant', plantSchema);
