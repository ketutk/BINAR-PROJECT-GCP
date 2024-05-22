const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendVerifyEmail } = require("../libs/nodemailer");
const { JWT_SECRET } = process.env;

exports.getUser = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({});

    return res.status(200).json({
      status: true,
      message: "Successfully get users data",
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.addUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "Missing required field",
        data: null,
      });
    }

    const duplicate = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (duplicate) {
      return res.status(400).json({
        status: false,
        message: "Email already used",
        data: null,
      });
    }

    const response = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });

    delete response.password;

    return res.status(201).json({
      status: true,
      message: "Successfully created account",
      data: {
        user: response,
      },
    });
  } catch (error) {
    next(error);
  }
};

// function login
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Missing required field",
        data: null,
      });
    }

    let user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Account not found.",
        data: null,
      });
    }

    let isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: false,
        message: "Invalid password.",
        data: null,
      });
    }
    delete user.password;

    let token = jwt.sign(user, JWT_SECRET);
    return res.status(200).json({
      status: true,
      message: "User logged in success",
      data: { ...user, token },
    });
  } catch (error) {
    next(error);
  }
};
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "Missing required field",
        data: null,
      });
    }

    const duplicate = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (duplicate) {
      return res.status(409).json({
        status: false,
        message: "Email already used",
        data: null,
      });
    }

    let encryptedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: encryptedPassword,
      },
    });

    delete user.password;

    return res.status(201).json({
      status: true,
      message: "Successfully created account",
      data: {
        user: user,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.sendVerify = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Account not found.",
        data: null,
      });
    }
    if (user.is_verified) {
      return res.status(409).json({
        status: false,
        message: "Account already verified.",
        data: null,
      });
    }

    user.verify = true;

    const token = jwt.sign(user, JWT_SECRET, {
      expiresIn: "15m",
    });
    const sendMail = await sendVerifyEmail(user, token);
    return res.status(200).json({
      status: false,
      message: "Mail sent. Please check your email",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    try {
      const decode = jwt.verify(token, JWT_SECRET);

      if (!decode.verify) {
        return res.status(401).json({
          status: false,
          message: "Invalid verify email token.",
          data: null,
        });
      }

      const user = await prisma.user.update({
        where: {
          id: decode.id,
          email: decode.email,
        },
        data: {
          is_verified: true,
        },
      });
      delete user.password;

      const tokenLogin = jwt.sign(user, JWT_SECRET);
      return res.status(200).json({
        status: false,
        message: "Verify Success. You're account is now verified",
        data: {
          user,
          token: tokenLogin,
        },
      });
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: "Invalid token",
        data: null,
      });
    }
  } catch (error) {
    next(error);
  }
};
