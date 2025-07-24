import axios from "axios";

const httpRequest = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
  
})

httpRequest.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    } else {
        delete config.headers["Authorization"];
    }
    return config;
});

let isRefreshing = false;
const tokenListener = []
function tokenSubscribe(listener) {
    tokenListener.push(listener)
}

function onRefreshed() {
    tokenListener.forEach((listener) => listener());
}
httpRequest.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalConfig = error.config;
        const refreshToken = localStorage.getItem("refresh_token");
        const shouldRenewToken = error.response?.status === 401 && refreshToken;

        if (shouldRenewToken) {
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const res = await axios.post(
                        `${import.meta.env.VITE_BASE_URL}/auth/refresh-token`,
                        {
                            refresh_token: refreshToken,
                        }
                    );
                    const data = res.data.data;

                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("refresh_token", data.refresh_token);

                    onRefreshed();
                    isRefreshing = false;

                    return httpRequest(originalConfig);
                } catch (refreshError) {
                    isRefreshing = false;
                    localStorage.removeItem("token");
                    localStorage.removeItem("refresh_token");

                    return Promise.reject(refreshError);
                }
            } else {
                return new Promise((resolve) => {
                    tokenSubscribe(() => {
                        resolve(httpRequest(originalConfig));
                    });
                });
            }
        }
        return Promise.reject(error)
    }
)

const send = async (method, url, data, config) => {
    // const isPutOrPatch = ["put", "patch"].includes(method.toLowerCase());
    // const effectiveMethod = isPutOrPatch ? "post" : method;
    // const effectivePath = isPutOrPatch
    //     ? `${url}${url.includes("?") ? "&" : "?"}_method=${method}`
    //     : url;

    // const response = await httpRequest.request({
    //     method: effectiveMethod,
    //     url: effectivePath,
    //     data,
    //     ...config,
    // });

    const response = await httpRequest.request({
        method,
        url,
        data,
        ...config
    })

    if (response.status >= 200 && response.status < 400) {
        return response.data;
    }
};

export const get = (url,config) => {
    return send("get", url,null, config)
}


export const post = (url,data,config) => {
    return send("post", url,data,config)
}

export const put = (url,data,config) => {
    return send("put", url,data,config)
}

export const patch = (url,data, config) => {
    return send("patch", url, data, config)
}

export const del = (url,config) => {
    return send("delete", url, null, config)
}

export const setToken = (token) => {
  if (token) {
    httpRequest.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export default {
    get,
    post,
    put,
    patch,
    del,
    setToken
}