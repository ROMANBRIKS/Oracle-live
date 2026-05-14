import multer from "multer";
import multerS3 from "multer-s3";
import { getS3 } from "../config/s3";

const s3 = getS3();

const upload = multer({
  storage: multerS3({
    s3: s3 as any,
    bucket: process.env.AWS_BUCKET || "oracle-replays",
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `replays/${Date.now()}-${file.originalname}`);
    },
  }),
});

export default upload;
