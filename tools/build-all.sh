#author yiminghe@gmail.com(chengyu)
#for apple/linux
#1.chmod 777 build.sh
#2.chmod 777 ant/bin/ant
ANT=../../kissy-tools/ant/bin/ant

src_files=`find ../src -name build.xml`
build_files=`find ../build -name build.xml`
for file in $src_files
do
    $ANT -buildfile $file
done

for file in $build_files
do
    $ANT -buildfile $file
done


