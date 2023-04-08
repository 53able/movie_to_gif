<template>
  <div class="container">
    <input type="file" accept="video/mp4,.mov" @change="onFileSelected">
    <button @click="convertToGif" :disabled="isDisabledConvertButton">変換</button>
    <progress class="progress-bar" v-if="state.progressVisible" :value="state.progressPercentage" max="100"></progress>
    <div class="slider-container">
      <div class="frame-rate-container">
        <label>フレームレート:</label>
        <input type="range" min="8" max="40" step="8" v-model="state.frameRate">
        <div class="frame-rate">{{ state.frameRate }} FPS</div>
      </div>
      <div class="scale-container">
        <label>スケール:</label>
        <input type="range" min="160" max="1024" step="8" v-model="state.scale">
        <div class="scale">{{ state.scale }} px</div>
      </div>
    </div>
    <div>
      <label>ディザリング</label>
      <ul class="dithers">
        <li v-for="(dither, index) in paletteuse" :key="index">
          <label>
            <input type="radio" :value="dither" v-model="state.dither">
            {{ dither }}
          </label>
        </li>
      </ul>
    </div>
    <p v-if="state.videoSize">元の動画ファイルの容量: {{ formatFileSize(state.videoSize) }}</p>
    <p v-if="state.gifSize">gif の容量: {{ formatFileSize(state.gifSize) }} (元の動画ファイルの容量の <span class="gif-percentage">{{ gifPercentage }}</span> %)</p>
    <div class="image-container">
      <img v-if="state.gifUrl" :src="state.gifUrl">
    </div>
  </div>
</template>


<script lang="ts" setup>
import { reactive, computed } from 'vue';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

type Dither = "bayer" | "floyd_steinberg" | "sierra2" | "sierra2_4a" | "heckbert" | "none";

type State = {
  videoUrl: string | null;
  gifUrl: string | null;
  videoSize: number | null;
  gifSize: number | null;
  progressVisible: boolean;
  progressPercentage: number;
  dither: Dither;
  frameRate: number;
  scale: number;
};

const state = reactive<State>({
  videoUrl: null,
  gifUrl: null,
  videoSize: null,
  gifSize: null,
  progressVisible: false,
  progressPercentage: 0,
  dither: "none",
  frameRate: 24,
  scale: 504,
});

const paletteuse:Array<Dither> = ["bayer", "floyd_steinberg", "heckbert", "none", "sierra2", "sierra2_4a"]

const formatFileSize = (size: number) => {
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + ' MB';
  return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB';
};

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    state.videoUrl = URL.createObjectURL(file);
    state.gifUrl = null;
    state.videoSize = file.size;
  }
  state.gifSize = null;
};


const convertToGif = async () => {
  state.progressVisible = true;
  const ffmpegInstance = createFFmpeg({ log: true });
  await ffmpegInstance.load();
  await ffmpegInstance.FS('writeFile', 'input.mp4', await fetchFile(state.videoUrl));
  ffmpegInstance.setProgress(({ ratio }) => {
    state.progressPercentage = Math.round(ratio * 100);
  });
  await ffmpegInstance.run('-i', 'input.mp4', '-filter_complex', `[0:v] fps=${state.frameRate},scale=${state.scale}:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse=dither=${state.dither}`, 'output.gif');
  const outputData = ffmpegInstance.FS('readFile', 'output.gif');
  state.gifSize = outputData.buffer.byteLength;
  state.gifUrl = URL.createObjectURL(new Blob([outputData.buffer], {type: 'image/gif'}));
  await new Promise(resolve => setTimeout(resolve, 500)); // プログレスバーを100%表示するための待機時間
  state.progressVisible = false;
};


const gifPercentage = computed(() => {
  if (!state.videoSize || !state.gifSize) return '';
  return ((state.gifSize / state.videoSize) * 100).toFixed(2);
});

const isSizeUp = computed(() => {
  if (!state.videoSize || !state.gifSize) return false;
  return state.gifSize > state.videoSize;
});

const isDisabledConvertButton = computed(() => {
  return state.videoUrl == null || state.progressVisible;
});
</script>


<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.image-container {
  margin-top: 1rem;
}

.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 10px;
  background-color: transparent;
  appearance: none;
}

.progress-bar::-webkit-progress-value {
  background-color: #007bff;
  transition: width 0.3s ease-in-out;
}

.dithers {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  list-style: none;
}

.gif-percentage {
  color: v-bind("isSizeUp ? 'red' : 'green'");
}

.slider-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}
</style>

