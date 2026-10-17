@echo off
setlocal
cd /d "%~dp0.."

set "INPUT=public\home\video\oil.webm"
set "OUTPUT=public\home\video\oil-loop.webm"

if not exist "%INPUT%" (
  echo ERROR: Cannot find %INPUT%
  echo Put the source oil.webm in public\home\video first.
  exit /b 1
)

where ffmpeg >nul 2>nul
if errorlevel 1 (
  echo ERROR: FFmpeg is not installed or not available in PATH.
  echo Install FFmpeg, reopen CMD, and run this script again.
  exit /b 1
)

echo Creating a forward-reverse seamless oil loop...
ffmpeg -y -i "%INPUT%" -filter_complex "[0:v]split=2[forward][backward];[backward]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[rev];[forward]setpts=PTS-STARTPTS[fwd];[fwd][rev]concat=n=2:v=1:a=0,format=yuv420p[v]" -map "[v]" -an -c:v libvpx-vp9 -b:v 0 -crf 30 -deadline good -cpu-used 3 -row-mt 1 "%OUTPUT%"

if errorlevel 1 (
  echo ERROR: Video processing failed.
  exit /b 1
)

echo.
echo DONE: %OUTPUT%
echo The website now plays forward, backward, and repeats automatically.
endlocal
