import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import placeholderImage from "../../assets/placeholder.svg";

// Chuẩn hoá đường dẫn ảnh
const normalizeUrl = (src) => {
    if (!src) return "";

    // Nếu đã là URL đầy đủ (http/https) hoặc là base64 data URL thì giữ nguyên
    if (/^https?:\/\//i.test(src) || src.startsWith("data:")) {
        return src;
    }

    // Lấy base URL từ env hoặc mặc định localhost
    const API_URL = new URL(
        import.meta.env.VITE_BASE_URL || "http://localhost:3000"
    );

    const ASSET_BASE_URL = `${API_URL.protocol}//${API_URL.host}`;

    // Chuyển \ thành / và bỏ public/ nếu có
    const imagePath = src
        .replace(/\\/g, "/")
        .replace(/^public\//, "");

    return `${ASSET_BASE_URL}/${imagePath}`;
};

const FallbackImage = ({
    src,
    alt = "",
    fallbackSrc = placeholderImage,
    className,
    style,
    onError,
    onLoad,
    lazy = false,
    ...props
}) => {
    const normalizedSrc = normalizeUrl(src);
    const normalizedFallback = normalizeUrl(fallbackSrc);

    const [imgSrc, setImgSrc] = useState(
        lazy
            ? normalizedFallback
            : normalizedSrc || normalizedFallback
    );

    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(!lazy);

    const imgRef = useRef(null);

    // Xử lý khi ảnh lỗi
    const handleError = (event) => {
        if (!hasError && imgSrc !== normalizedFallback) {
            setHasError(true);
            setImgSrc(normalizedFallback);
        }

        if (onError && imgSrc !== normalizedFallback) {
            onError(event);
        }
    };

    // Xử lý khi ảnh load xong
    const handleLoad = (event) => {
        if (imgSrc === normalizedSrc) {
            setHasError(false);
        }

        if (onLoad) {
            onLoad(event);
        }
    };

    // Lazy loading
    useEffect(() => {
        if (!lazy || !imgRef.current || isLoaded) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;

                if (entry.isIntersecting) {
                    setImgSrc(normalizedSrc || normalizedFallback);
                    setIsLoaded(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, [lazy, normalizedSrc, normalizedFallback, isLoaded]);

    // Cập nhật ảnh khi src thay đổi
    useEffect(() => {
        if (!lazy && normalizedSrc) {
            setImgSrc(normalizedSrc);
            setHasError(false);
        } else if (lazy && isLoaded && normalizedSrc) {
            setImgSrc(normalizedSrc);
            setHasError(false);
        } else if (!normalizedSrc) {
            setImgSrc(normalizedFallback);
            setHasError(false);
        }
    }, [normalizedSrc, normalizedFallback, lazy, isLoaded]);

    return (
        <img
            ref={imgRef}
            src={imgSrc}
            alt={alt}
            className={className}
            style={style}
            onError={handleError}
            onLoad={handleLoad}
            loading={lazy ? "lazy" : "eager"}
            {...props}
        />
    );
};

FallbackImage.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    fallbackSrc: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    onError: PropTypes.func,
    onLoad: PropTypes.func,
    lazy: PropTypes.bool,
};

export default FallbackImage;