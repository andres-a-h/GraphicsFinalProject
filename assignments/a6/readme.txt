MOON NORMALMAP
Guillermo Abramson
http://fisica.cab.cnea.gov.ar/estadistica/abramson
	
This is a detailed (8k) NormalMap of the Moon, composed from two maps available at the Map-a-planet website: a shaded relief map, and a photographic map. It is just an approximation of a true normalmap based on height information, and it's not meant to be considered in any way scientifically correct. Use it just for fun, since it looks respectably good both from close range and as seen from Earth, until we have good elevation data of the whole Moon. I have made the relief rather subtle because I like it this way. If you prefer otherwise, just follow the instructions below. It takes some practice, but you can make your own if you don't like mine.

HOW I MADE IT (WITH TIPS FROM MATTIAS MALMER)
The shaded map is illuminated from the east (right), and makes the red channel of the normalmap. The Clementine and other photographic maps are illuminated from the zenith at the equator, and can be used to generate a green channel. Because of its equatorial illumination, higher latitudes are illuminated "from the equator" and contain enough shading to reconstruct the normals. One of the hemispheres needs to be inverted (made negative) to homogenize the normals. A lot of tonal correction is also needeed to match the discontinuity at the equator, as well as to mask the seas and ray systems (that are flat). The equatorial regions result always illuminated from a side, but fortunately the Moon's orientation makes this realistic enough. This is the procedure followed by Mattias Malmer, who has a similar map at the Celestiamotherlode, but which is a jpg with strong artifacts, and much stronger relief.
	
SUMMARY OF STEPS ON PHOTOSHOP
1. Put the shaded relief in channel red.
2. Put the photographic in channel green.
3. Select red channel.
4. Set levels: output levels 80 140, gamma 2
5. Select green channel.
6. Select southern hemisphere and invert (to have homogeneous illumination at high latitude).
7. Select feathered regions of seas (and inverted seas) and change levels to neutralize.
8. Airbrush details to neutralize in low and mid-latitudes.
9. Select an equatorial band (feathered) and gaussian blur strong.
10. Repeat in three bands at higher latitudes, with less blur (last, 4px)
11. Select all green channel and set levels, output levels 55 200, gamma 1.
12. Blue channel, leave white.

If you have a modern GeForce graphics card, you may wish to convert the normalmap to the nVidia compressed dxt5nm format, specific for normalmaps. Use the nVidia tools as shown below, or the Photoshop plugin provided by nVidia, and then change the extension of the resulting file from .dds to dxt5nm (Celestia requires it for understanding it as a normalmap).

NVDXT v7.x:
nvdxt -norm -nomips -file MoonNormal.png -dxt5nm -outfile MoonNormal

NVDXT v8.3:
nvdxt -dxt5nm -norm -nomipmap -file MoonNormal.png -output MoonNormal

HOW TO USE IT IN CELESTIA
You use a NormalMap in addition to a texture map, to show relief according to illumination. If you want to modify the official Moon, create the following structure under your extras folder:
extras
  moon
    textures
      hires
      medres
      lores
Copy the NormalMap to the hires folder. If you wish, resize the map to 4k and 2k, and copy those to medres and lores respectively. Edit the following text in your text editor (such as Notepad) and save it as moon.ssc in the folder extras/moon:
Modify "Moon" "Sol/Earth" {
  NormalMap "MoonNormal.*"
}	
If you wish to use the NormalMap with any Alternative Texture you may have installed, copy the map to the corresponding hires folder, and add the line NormalMap "MoonNormal.*" to the ssc file that defines the texture.

THE SOURCES	
Map a planet: http://www.mapaplanet.org/
Shaded relief reduced to 8k (illuminated from the right)
Clementine or other photographic 8k (illuminated from above, then at high latitude "from the equator")
	
CELESTIA: http://shatters.net/celestia

(c) 2008 Guillermo Abramson
http://fisica.cab.cnea.gov.ar/estadistica/abramson
Some rights reserved. You are welcome to use this maps for your own personal or educational purposes. Commercial uses are not allowed. Proper credit will be acknowledged. If you like the maps, please let me know.
