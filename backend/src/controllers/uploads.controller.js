const path =
    require("path");

const { randomUUID } =
    require("crypto");

const supabase =
    require("../config/supabase");

const RESOURCE_STORAGE_BUCKET =
    "course-resources";

const UPLOAD_TYPE_TO_STORAGE_BUCKET = {
    resources:
        RESOURCE_STORAGE_BUCKET,
    submissions:
        "submissions",
    payments:
        "payments",
    mentorships:
        "mentorships",
    avatars:
        "avatars"
};

const getSafeExtension =
    (fileName) => {

        const extension =
            path.extname(fileName || "")
                .toLowerCase();

        return extension.replace(
            /[^a-z0-9.]/g,
            ""
        );

    };

const buildStorageFileName =
    (file) => {

        const extension =
            getSafeExtension(
                file.originalname
            );

        return `${Date.now()}-${randomUUID()}${extension}`;

    };

const uploadFile =
    async (req, res) => {

        try {

            const { bucket: uploadType } =
                req.params;

            const storageBucket =
                UPLOAD_TYPE_TO_STORAGE_BUCKET[uploadType];

            if (!storageBucket) {

                return res.status(400).json({
                    error:
                        "Bucket no permitido."
                });

            }

            if (!req.file) {

                return res.status(400).json({
                    error:
                        "Debes enviar un archivo."
                });

            }

            const fileName =
                buildStorageFileName(
                    req.file
                );

            const { error } =
                await supabase
                    .storage
                    .from(storageBucket)
                    .upload(
                        fileName,
                        req.file.buffer,
                        {
                            contentType:
                                req.file.mimetype,
                            upsert:
                                false
                        }
                    );

            if (error) {

                console.error(
                    "[uploads] Error al subir archivo",
                    {
                        routeBucket:
                            uploadType,
                        storageBucket,
                        fileName,
                        originalName:
                            req.file.originalname,
                        mimetype:
                            req.file.mimetype,
                        error
                    }
                );

                return res.status(400).json(error);

            }

            const { data } =
                supabase
                    .storage
                    .from(storageBucket)
                    .getPublicUrl(fileName);

            res.json({
                url:
                    data.publicUrl
            });

        } catch (err) {

            console.error(
                "[uploads] Error inesperado al subir archivo",
                {
                    bucket:
                        req.params.bucket,
                    originalName:
                        req.file
                            ? req.file.originalname
                            : null,
                    error:
                        err
                }
            );

            res.status(500).json({
                error:
                    err.message
            });

        }

    };

module.exports = {
    uploadFile
};
