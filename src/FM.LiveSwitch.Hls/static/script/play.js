var play = function(video, source) {
    if (Hls.isSupported()) {
        var hls = new Hls()
        hls.loadSource(source)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play()
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source
        video.addEventListener('loadedmetadata', function() {
            video.play()
        })
    }
}