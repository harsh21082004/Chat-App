import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const VideoSkeleton = () => (
  <>
    <SkeletonTheme baseColor="#202020" highlightColor="#444">
      <div className="skeleton-wrapper">
        <div className="skeleton-content">
          <Skeleton width="100%" height='100%' />
        </div>
      </div>
    </SkeletonTheme>

    <style jsx>{`
      .skeleton-wrapper {
        align-items: center;
        gap: 1rem;
        position: absolute;
        padding: 0 !important;
        z-index: 5;
        width: 100% !important;
        height: 100% !important;
        top: 0;
        left: 0;
      }

      .skeleton-content {
        width: 100% !important;
        height: 100% !important;
        padding: 0 !important;
        box-sizing: border-box;
      }

      .skeleton-content span:nth-child(even) {
        display: flex;
        justify-content: flex-end;
      }

      .skeleton-content span{
        display: flex
        height: 100%;
        border-radius: 10px;
      }
    `}</style>
  </>
);

export default VideoSkeleton;
