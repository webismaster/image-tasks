import React, { useEffect, useState } from "react";

import restartIon from "../assets/mdi_restart.svg";
import zoomIcon from "../assets/tabler_zoom-in-filled.svg";
import dropIcon from "../assets/mdi_water-opacity.svg";
import gameIcon from "../assets/game-icons_level-four.svg";

import cornerstone from "cornerstone-core";
import cornerstoneMath from "cornerstone-math";
import cornerstoneTools from "cornerstone-tools";
import Hammer, { off } from "hammerjs";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

cornerstoneTools.init();
cornerstoneWADOImageLoader.webWorkerManager.initialize();

cornerstoneTools.init({
  mouseEnabled: true,
  touchEnabled: true,
  globalToolSyncEnabled: true,
  showSVGCursors: false,
});

const CategoryCard = ({ hideTitle, cat, type, images }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [imageIds, setImageIds] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // let element;
  let elementId = `dicomImag${cat}`;

  // Add and activate tools
  cornerstoneTools.addTool(cornerstoneTools.StackScrollTool);
  cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);
  cornerstoneTools.setToolActive('StackScroll', { mouseButtonMask: 1 });
  cornerstoneTools.setToolActive('StackScrollMouseWheel', { });

  const synchronizer = new cornerstoneTools.Synchronizer(`CornerstoneImageScroll${elementId}`, cornerstoneTools.stackScrollSynchronizer);

  // ... (other functions remain unchanged)

  const handleFullscreenToggle = () => {
    const element = document.getElementById(`${elementId}`);

    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }

    setIsFullscreen(!isFullscreen);
  };

  const handleExitFullscreen = () => {
    // Exit fullscreen mode
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }

      // Update the state to indicate that fullscreen mode is not active
      setIsFullscreen(false);
    }
  };

  const loadAndViewImage = (imageId) => {
    const element = document.getElementById(`${elementId}`);
    const start = new Date().getTime();
    cornerstone.loadImage(imageId).then(
      function (image) {
        console.log(image);
        const viewport = cornerstone.getDefaultViewportForImage(element, image);
        cornerstone.displayImage(element, image, viewport);
      },
      function (err) {
        alert(err);
      }
    );
  };
  const handleReset = () => {
    const element = document.getElementById(`${elementId}`);

    // Reset zoom and pan
    cornerstone.reset(element);

    // Reset other tools if needed
    const stack = cornerstoneTools.getToolState(element, "stack");
    if (stack && stack.data && stack.data.length > 0) {
      stack.data[0].currentImageIdIndex = 0;
    }

    // Reset other tools as necessary (example: length tool)
    const lengthToolData = cornerstoneTools.getToolState(element, "Length");
    if (
      lengthToolData &&
      lengthToolData.data &&
      lengthToolData.data.length > 0
    ) {
      lengthToolData.data[0].measurementData.measurementValue = 0;
    }

    // Call updateImage to redraw the image after reset
    cornerstone.updateImage(element);
  };

  // loadAndViewImage`${elementId}`;

  // useEffect(() => {
  //   element = document.getElementById(`${elementId}`);
  //   cornerstone.enable(element);
  // }, []);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const imageIds = await Promise.all(
          images.map(async (imagePath) => {
            const imageId = `wadouri:${imagePath}`;
            return imageId;
          })
        );

        setImageIds(imageIds);

        // Load and display the first image
        const element = document.getElementById(`dicomImag${cat}`);
        // const copyElement = document.getElementById(`dicomImag${cat}-copy`);

        cornerstone.enable(element);
        // cornerstone.enable(copyElement);
        
        const image = await cornerstone.loadImage(imageIds[0]);
        const viewport = cornerstone.getDefaultViewportForImage(element, image);
        // const viewportCopy = cornerstone.getDefaultViewportForImage(copyElement, image);

        cornerstone.displayImage(element, image, viewport);
        // cornerstone.displayImage(copyElement, image, viewportCopy)

        // Create a stack object and assign imageIds to it
        const stack = {
          currentImageIdIndex: 0,
          imageIds: imageIds,
        };

        const stack1 = {
          currentImageIdIndex: 1,
          imageIds: imageIds,
        };

        // Add the stack to the cornerstone tools
        cornerstoneTools.addStackStateManager(element, ['stack', 'Crosshairs']);
        cornerstoneTools.addToolState(element, "stack", stack);

        // cornerstoneTools.addStackStateManager(copyElement, ['stack', 'Crosshairs']);
        // cornerstoneTools.addToolState(copyElement, "stack", stack1);

        // cornerstoneTools.stackScroll.activate(element, 1);
        // cornerstoneTools.stackScrollWheel.activate(element);

        // cornerstoneTools.stackScroll.activate(copyElement, 1);
        // cornerstoneTools.stackScrollWheel.activate(copyElement);
        cornerstoneTools.setToolActiveForElement(element, "StackScroll", {})
        // cornerstoneTools.setToolActiveForElement(copyElement, "StackScroll", {})
        cornerstoneTools.setToolActiveForElement(element, "StackScrollMouseWheel", {})
        // cornerstoneTools.setToolActiveForElement(copyElement, "StackScrollMouseWheel", {})

        synchronizer.add(element.childNodes[0]);
        // synchronizer.add(copyElement.childNodes[0]);

        console.log(synchronizer, synchronizer.getTargetElements(), cornerstoneTools.stackScrollWheel, "werwerwefweasdasd")

        // Enable the StackScrollMouseWheelTool to enable scrolling through the stack
        // const StackScrollMouseWheelTool =
        //   cornerstoneTools.StackScrollMouseWheelTool;
        // cornerstoneTools.addTool(StackScrollMouseWheelTool);
        // cornerstoneTools.setToolEnabled('StackScrollMouseWheel', {
        //   synchronizationContext: synchronizer,
        // });
        // cornerstoneTools.setToolActive("StackScrollMouseWheel", {});
        // cornerstoneTools.setToolActive("StackScrollMouseWheel", {});
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    loadImages();
  }, []);

  const handleFileChange = (imageUrls) => {
    debugger;
    const files = Array.from(imageUrls.target.files);
    setUploadedFiles(files);

    const imageIds = files.map((file) => {
      return cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
    });

    setImageIds(imageIds);

    const stack = {
      currentImageIdIndex: 0,
      imageIds: imageIds,
    };

    cornerstone.loadAndCacheImage(imageIds[0]).then((image) => {
      const element = document.getElementById(`${elementId}`);
      cornerstone.displayImage(element, image);
      cornerstoneTools.addStackStateManager(element, ["stack"]);
      cornerstoneTools.addToolState(element, "stack", stack);
    });

    // Add the Stack Scroll tool and make it active
    const StackScrollMouseWheelTool =
      cornerstoneTools.StackScrollMouseWheelTool;
    cornerstoneTools.addTool(StackScrollMouseWheelTool);
    cornerstoneTools.setToolActive("StackScrollMouseWheel", {});
  };

  const setZoomActive = (e) => {
    const ZoomMouseWheelTool = cornerstoneTools.ZoomMouseWheelTool;

    cornerstoneTools.addTool(ZoomMouseWheelTool);
    cornerstoneTools.setToolActive("ZoomMouseWheel", { mouseButtonMask: 1 });
    const PanTool = cornerstoneTools.PanTool;

    cornerstoneTools.addTool(PanTool);
    cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });
  };

  const setMouseWheelActive = (e) => {
    const StackScrollMouseWheelTool =
      cornerstoneTools.StackScrollMouseWheelTool;
    cornerstoneTools.addTool(StackScrollMouseWheelTool);
    cornerstoneTools.setToolActive("StackScrollMouseWheel", {});
  };

  const setLengthActive = (e) => {
    const LengthTool = cornerstoneTools.LengthTool;
    cornerstoneTools.addTool(LengthTool);
    cornerstoneTools.setToolActive("Length", { mouseButtonMask: 1 });
  };

  const setWwwcActive = (e) => {
    const WwwcTool = cornerstoneTools.WwwcTool;
    cornerstoneTools.addTool(WwwcTool);
    cornerstoneTools.setToolActive("Wwwc", { mouseButtonMask: 1 });
  };

  const setEraserActive = (e) => {
    const EraserTool = cornerstoneTools.EraserTool;
    cornerstoneTools.addTool(EraserTool);
    cornerstoneTools.setToolActive("Eraser", { mouseButtonMask: 1 });
  };

  const setScrollActive = () => {
    const StackScrollTool = cornerstoneTools.StackScrollTool;
    cornerstoneTools.addTool(StackScrollTool)
    cornerstoneTools.setToolActive('StackScroll', { mouseButtonMask: 1 })
  }

  return (
    <div className="w-full custom-shadow p-5 rounded-[22px]">
      {!hideTitle && <h3 className="h3-bold">Category {cat}</h3>}
      {!hideTitle && <p className="body-light mt-2">Type {type}</p>}

      <div className="flex flex-col justify-between overflow-scroll custom-scrollbar  h-[250px] ">
        {/* <input
          type="file"
          className="body-light"
          onChange={handleFileChange}
          multiple
        /> */}

        {/* <button onClick={setMouseWheelActive} style={{ marginLeft: "10px" }}>
            Scroll
          </button> */}

        <div className="" id="thumbnail-list">
          {imageIds.map((imageId) => {
            return (
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a
                onContextMenu={() => false}
                unselectable="on"
                onMouseDown={() => false}
                onSelect={() => false}
              >
                <div
                  id={imageId}
                  className="rounded-[8px]"
                  onContextMenu={() => false}
                  unselectable="on"
                  onMouseDown={() => false}
                  onSelect={() => false}
                />
              </a>
            );
          })}
        </div>

        {isFullscreen && (
          <button
            className="absolute  z-10 top-32 right-2 p-2 bg-white h-20 w-20  text-red rounded-full"
            onClick={handleExitFullscreen}
          >
            Xasdad
          </button>
        )}

          <div onContextMenu={() => false} unselectable="on">
            <div id={elementId} />
          </div>

          {/* <div onContextMenu={() => false} unselectable="on">
            <div id={`${elementId}-copy`} />
          </div> */}

        <div className="flex-center gap-10 mb-1 ">
          <button
            className="p-1 custom-shadow rounded-[8px] h-8 w-8 "
            onClick={handleReset}
          >
            <img src={restartIon} alt="rest" className="h-7 w-7" />
          </button>
          <button
            className="p-1 custom-shadow rounded-[8px] h-8 w-8 "
            onClick={setZoomActive}
          >
            <img src={zoomIcon} alt="rest" className="h-7 w-7" />
          </button>
          <button
            className="p-1 custom-shadow rounded-[8px] h-8 w-8"
            onClick={setWwwcActive}
          >
            <img src={dropIcon} alt="rest" className="h-7 w-7" />
          </button>
          <button
            className="p-1 custom-shadow rounded-[8px] h-8 w-8 "
            onClick={setScrollActive}
          >
            <img src={gameIcon} alt="rest" className="h-7 w-7" />
          </button>
        </div>
        {/* {images.map((img, idx) => (
          <DwvImage image={img} />

        
        ))} */}
        {/* <UploadFiles img={imageUplaod} /> */}
        {/* {image2 && <UploadFiles img={imageUplaod} />} */}
      </div>
    </div>
  );
};

export default CategoryCard;
