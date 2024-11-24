// Import dependencies
const express = require("express");
const morgan = require("morgan");
const photizoRouter = require("./routes/photizoRoute");
const expressRateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const xssFilters = require("xss-filters");
const compression = require("compression");
const MongoStore = require('connect-mongo');

// Initialize app
const app = express();

// Middleware configuration
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const conn = process.env.NODE_ENV === 'development' ? process.env.LOCAL_CONN : process.env.GLOBAL_CONN;
// Set up session with a secret and options
app.use(require("express-session")({
  secret: 'n0bFEermYgBlOs23Njk/y98W6A/T2PdRsz+MNFj3DpVVKcpF7tTyHVgnFfKbA8uV',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
      mongoUrl: conn, // Use the same MongoDB connection string
      collectionName: 'sessions' // You can customize the collection name
  })
}));

// Flash messages setup
app.use(flash());
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// Security settings
app.use(helmet()); // General security headers

// Define allowed script sources for CSP
const allowedScriptSources = [
  "'self'", // Allow scripts from the same origin
  'https://code.jquery.com/', // Add jQuery CDN to the list
  'https://unpkg.com/aos@2.3.1/dist/aos.js', // AOS library
  'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/', // Slick carousel
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
  "'unsafe-inline'" // Allow inline scripts (though this could be a security risk)
];

const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'", 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/', 'https://unpkg.com/aos@2.3.1/dist/aos.js','https://fonts.googleapis.com','https://code.jquery.com/'],
    imgSrc: ["'self'",'data:', 'blob:'],
    scriptSrcElem: allowedScriptSources, // Updated script-src to include jQuery
    mediaSrc: ["'self'", 'https://www.youtube.com/'],
    frameSrc: ["'self'", 'https://www.google.com/'],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  }
};
app.use(helmet.contentSecurityPolicy(cspConfig));
app.disable('x-powered-by');

// Rate limiter to prevent abuse
const limiter = expressRateLimiter({
  max: 1500, // Max 1500 requests per hour
  windowMs: 60 * 60 * 1000,
  handler: (_, res) => {
    res.status(429).send({
      status: "fail",
      message: "Too many requests from this IP, try again later."
    });
  }
});
app.use('/bisum', limiter);

// Sanitize data against NoSQL injection and XSS
app.use(mongoSanitize());

// Sanitize input data function
const sanitizeInput = (req, _, next) => {
  req.params = sanitizeObject(req.params);
  req.query = sanitizeObject(req.query);
  req.body = sanitizeObject(req.body);
  next();
};
const sanitizeObject = (obj) => {
  const sanitizedObj = {};
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      sanitizedObj[key] = xssFilters.inHTMLData(obj[key]);
    }
  }
  return sanitizedObj;
};
app.use(sanitizeInput); // Apply input sanitizer

// Enable compression
app.use(compression({
  level: 6,
  threshold: 0,
  filter: (req, res) => {
    return !req.headers['x-no-compression'] && compression.filter(req, res);
  }
}));

// Logging and static files
if(process.env.NODE_ENV === 'development') {
  app.use(morgan("dev"));
}
app.use(express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "stylesheets")));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/bisum/assets', express.static(path.join(__dirname, 'assets')));
app.use('/bisum/admin/UrO89GZnBXTuVToc/tomS6CdYNFXuIJhXCKdoOCbYSA=/table/:admin/assets', express.static(path.join(__dirname, 'assets')));

// View engine setup
app.set("view engine", "ejs");
app.set("trust proxy", 1);

// Routes
app.get("/",(_,res)=>{
  res.redirect("/bisum");
})
app.use("/bisum", photizoRouter); 
// 404 error page
app.get("*", (_, res) => {
  res.render("notFoundPage");
});

// Global error handling middleware
app.use((_, res) => {
  res.status(error.statusCode || 500).send({
    status: error.status || 'Internal Server Error',
    message: error.message || 'Something went wrong',
    stackTrace: process.env.NODE_ENV === 'development' && error.stack,
    error: process.env.NODE_ENV === 'development' && error
  });});

module.exports = app;
