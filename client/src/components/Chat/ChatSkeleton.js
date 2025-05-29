import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ChatSkeleton = () => (
  <>
    <SkeletonTheme baseColor="#202020" highlightColor="#444">
      <div className="skeleton-wrapper">
        <div className="skeleton-content">
          <Skeleton width="40%" height={40} />
          <Skeleton width="40%" height={150} />
          <Skeleton width="40%" height={150} />
          <Skeleton width="40%" height={40} />
        </div>
      </div>
    </SkeletonTheme>

    <style jsx>{`
      .skeleton-wrapper {
        display: flex;
        height: calc(100% - 160px);
        align-items: center;
        gap: 1rem;
        padding: 1rem;
      }

      .skeleton-content {
      width: 100%;
      }

      .skeleton-content span:nth-child(even) {
        display: flex;
        justify-content: flex-end;
      }
    `}</style>
  </>
);

export default ChatSkeleton;
