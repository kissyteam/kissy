<?php
    $imgList = Array("http://pic.yupoo.com/ucdcn_v/BkKTL421/metal.jpg",
                    "http://pic.yupoo.com/ucdcn_v/BkKMC9Ri/metal.jpg",
                    "http://pic.yupoo.com/ucdcn_v/BkKHQJBh/metal.jpg",
                    "http://pic.yupoo.com/ucdcn_v/BkKfc9SG/metal.jpg",
                    "http://pic.yupoo.com/ucdcn_v/BkKGzN7u/metal.jpg",
                    "http://pic.yupoo.com/ucdcn_v/BkKfc9SG/metal.jpg",
                    "http://pic.yupoo.com/ucdcn_v/BkKGzN7u/metal.jpg",
                    "http://pic.yupoo.com/ucdcn_v/BkKfc9SG/metal.jpg",
                    "http://pic.yupoo.com/ucdcn_v/BkKGzN7u/metal.jpg");
    for ($i = 0; $i < 8; $i++) {
?>
<div class="pin ks-waterfall">
    <a href="#" class="image" style="height: 256px;">
        <img style="height: 256px;" alt="Ô­À´µÄ" src="<?php echo $imgList[$i]; ?>"/>
    </a>
</div>
<?php } ?>