const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema(
   {
      name: { type: String, required: true, trim: true },
      email: {
         type: String,
         unique: true,
         require: true,
         trim: true,
         lowercase: true,
         validate(value) {
            if (!validator.isEmail(value)) throw new Error('Email is invalid');
         },
      },
      age: {
         type: Number,
         default: 0,
         validate(value) {
            if (value < 0) throw new Error('Age must be a positive number');
         },
      },
      password: {
         type: String,
         required: true,
         trim: true,
         minlength: 7,
         validate(value) {
            if (value.toLowerCase().includes('password'))
               throw new Error('password shouldn\'t include "password"');
         },
      },
      tokens: [
         {
            token: {
               type: String,
               required: true,
            },
         },
      ],
      avatar: {
         type: Buffer,
      },
   },
   {
      timestamps: true,
   }
);

userSchema.virtual('tasks', {
   ref: 'Task',
   localField: '_id',
   foreignField: 'owner',
});

userSchema.methods.generateAuthToken = async function() {
   const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);
   this.tokens = this.tokens.concat({ token });
   await this.save();
   return token;
};

userSchema.methods.toJSON = function() {
   const user = this.toObject();
   delete user.password;
   delete user.tokens;
   delete user.avatar;
   return user;
};

userSchema.statics.findByCredentials = async (email, password) => {
   const user = await User.findOne({ email });
   if (!email) throw new Error('Unable to login');
   const isMathc = await bcrypt.compare(password, user.password);
   if (!isMathc) throw new Error('Unable to login');
   return user;
};

// Hash the plain text password before saving
userSchema.pre('save', async function(next) {
   if (this.isModified('password'))
      this.password = await bcrypt.hash(this.password, 8);
   next();
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
   await Task.deleteMany({ owner: this._id });
   next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
