import { Model } from "@/components/Avatar/Model";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { ImageBackground, View } from "react-native";
import { PerspectiveCamera } from "@react-three/drei";


const avatarTest = () => {
    const json = {
        "audio": "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nyKIuqlJaVClGXxhdUIVzCzaN+tERxriD5Xdpf//////9fo9H06q7GIOrRGRlQCBNgVHNUI4QP+y4YJJ2IZdtCmVS0iBp5mBOWx5YoNIg0RGUtHWKvUja3i4dbbc1yTvrmdyqRKXIAMg2SH4tHWOkmLf7f/zYMTbJVPqiATTCt0nkk7PwDEr0zEg0P5Cr+sbBauw6k9Mcusdh538qZn/IThZ0p9pf/mfCmoRrKMOFWN6v//zYApUWAqhY6fEAWPjg4oAwhawApNyaoUGjBrQvZiYg73wSzaxYg2mp5kHOLKOJrCXhIn5Deq/7lJdy4Ryv9yZ/8/XhjCKEBFEgUG2EICgkqit5RJWkugpHRH1UP/zYsTUIZrOjY7KxrzsiigSMT/KWPY5q1f5V6P/+6opnVDHDlDR4wr//+1TmKI4UigjAIkSaDbRSgCgC1NEUljYsgeV0BJhwuiJDL9PFKnen/oqzd1izOiE2YpqsMjG9ZWt3///nE19w/6UprWvTeNb66jsT4SGQw1MHSTRWHlVhbZ00u6YUkf5XJClYSBbjX4wXlVSoZRcPwZpFQf/82LE3R4iwo2+yYScsKt/xr5RrjHVm9RzvQ3/5FHsMIJvOEDCSlv///////8uzW82QuhRQweESjhWKFs1TEFNRVVVVQLArCQ3MZeMFG7elxE4q0mo8lPYrf+VaaV6RMFgR1YmRSRqsf//zVmhNSbpVep/+epMoXoVBtU4E+LIVYBYmti/40RZ4YzdFGG9HiwwWIdCCau3oZv/T0da//NgxPQk2/5oTNvKvV0YyMrF87//Eh6kCxIyoZBrv//5L8kRRpwCColBo2giTEFNRaqqEAs6QrjrXDTw8gjq0lTIrMmiMOymz+5lpbzRKJzYknoSiMZPHJ7l+mYVuWXXW1tcxz5mzL0pj6GIyuydEEDqFH21BKNfth0OOYaHuTWTTf+SLSKoCoRoBsDYVFRWvmJv//+Ysk2vkORw//NixOgeOsZtjspKvLPTKVWhxKHSTf//7SbkqVkv/+eRBnRnpUi1Z34SPXjzqhBVE/MQ4lbSNBkBA5Y6UMGBhBxLWdaoZT9Y+bNGlxUtr5TaiSEmJhIMUnnouEiJakpatRJCgMxNW5v+U+VLXv7PFGnFXF5Us7/s8bNN//st9ltltlv2eLRJCT1JPhxeJNsnHqCgUUYHIlJo1eSz5v/zYsT5IoKmSO7DEJzLdv//jfMZ8p2//yjWtE4rZp8p///lS17LbLXlNst8p2/8s8JG1UxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/82LE/yUMFcwgeMxaVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",
        "visemes": [
            {
                "time": 6,
                "type": "viseme",
                "value": "k"
            },
            {
                "time": 49,
                "type": "viseme",
                "value": "@"
            },
            {
                "time": 78,
                "type": "viseme",
                "value": "t"
            },
            {
                "time": 178,
                "type": "viseme",
                "value": "o"
            },
            {
                "time": 513,
                "type": "viseme",
                "value": "sil"
            },
            {
                "time": 700,
                "type": "viseme",
                "value": "T"
            },
            {
                "time": 759,
                "type": "viseme",
                "value": "i"
            },
            {
                "time": 811,
                "type": "viseme",
                "value": "s"
            },
            {
                "time": 898,
                "type": "viseme",
                "value": "i"
            },
            {
                "time": 940,
                "type": "viseme",
                "value": "s"
            },
            {
                "time": 1017,
                "type": "viseme",
                "value": "@"
            },
            {
                "time": 1058,
                "type": "viseme",
                "value": "t"
            },
            {
                "time": 1189,
                "type": "viseme",
                "value": "E"
            },
            {
                "time": 1280,
                "type": "viseme",
                "value": "s"
            },
            {
                "time": 1363,
                "type": "viseme",
                "value": "t"
            },
            {
                "time": 1419,
                "type": "viseme",
                "value": "@"
            },
            {
                "time": 1463,
                "type": "viseme",
                "value": "f"
            },
            {
                "time": 1522,
                "type": "viseme",
                "value": "e"
            },
            {
                "time": 1643,
                "type": "viseme",
                "value": "t"
            },
            {
                "time": 1697,
                "type": "viseme",
                "value": "E"
            },
            {
                "time": 1780,
                "type": "viseme",
                "value": "p"
            },
            {
                "time": 1817,
                "type": "viseme",
                "value": "@"
            },
            {
                "time": 1847,
                "type": "viseme",
                "value": "t"
            },
            {
                "time": 1877,
                "type": "viseme",
                "value": "i"
            },
            {
                "time": 1932,
                "type": "viseme",
                "value": "u"
            },
            {
                "time": 2057,
                "type": "viseme",
                "value": "E"
            },
            {
                "time": 2141,
                "type": "viseme",
                "value": "s"
            },
            {
                "time": 2222,
                "type": "viseme",
                "value": "p"
            },
            {
                "time": 2340,
                "type": "viseme",
                "value": "a"
            },
            {
                "time": 2450,
                "type": "viseme",
                "value": "t"
            },
            {
                "time": 2538,
                "type": "viseme",
                "value": "i"
            },
            {
                "time": 2606,
                "type": "viseme",
                "value": "T"
            },
            {
                "time": 2697,
                "type": "viseme",
                "value": "r"
            },
            {
                "time": 2774,
                "type": "viseme",
                "value": "u"
            },
            {
                "time": 2807,
                "type": "viseme",
                "value": "f"
            },
            {
                "time": 2902,
                "type": "viseme",
                "value": "a"
            },
            {
                "time": 3041,
                "type": "viseme",
                "value": "s"
            },
            {
                "time": 3106,
                "type": "viseme",
                "value": "t"
            },
            {
                "time": 3165,
                "type": "viseme",
                "value": "e"
            },
            {
                "time": 3269,
                "type": "viseme",
                "value": "p"
            },
            {
                "time": 3394,
                "type": "viseme",
                "value": "i"
            },
            {
                "time": 3514,
                "type": "viseme",
                "value": "a"
            },
            {
                "time": 3876,
                "type": "viseme",
                "value": "sil"
            }
        ]
    }
  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      className="w-[96%] h-56 rounded-xl mx-auto my-2 overflow-hidden"
    >
      <Suspense fallback={null}>
        <View className="absolute bottom-0 right-0 left-0 top-0">
          <Canvas
            gl={{ localClippingEnabled: true }}
            onCreated={(state) => {
              const _gl = state.gl.getContext();
              const pixelStorei = _gl.pixelStorei.bind(_gl);
              _gl.pixelStorei = function (...args) {
                const [parameter] = args;
                switch (parameter) {
                  case _gl.UNPACK_FLIP_Y_WEBGL:
                    return pixelStorei(...args);
                }
              };
            }}
            
          >
            <PerspectiveCamera makeDefault position={[0, 0.8, 4]} fov={50} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} />
            <Model audio={json.audio} visemes={json.visemes} />
          </Canvas>
        </View>
      </Suspense>
    </ImageBackground>
  );
};
export default avatarTest;