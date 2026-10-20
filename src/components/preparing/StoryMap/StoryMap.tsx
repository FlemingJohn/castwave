import { StoryMapEdge } from "@/components/preparing/StoryMapEdge/StoryMapEdge";
import { StoryMapNode } from "@/components/preparing/StoryMapNode/StoryMapNode";
import type { StoryMapProps } from "./StoryMapProps";
import { layOutStoryMap } from "./layOutStoryMap";
import styles from "./StoryMap.module.css";

export function StoryMap(props: StoryMapProps) {
  const layout = layOutStoryMap(props.scenes, props.firstSceneId);
  const isVisited = (sceneId: string) => props.visitedSceneIds.includes(sceneId);
  return (
    <div className={styles.scroll}>
      <svg
        className={styles.map}
        viewBox={`-1 -1 ${layout.width} ${layout.height}`}
        role="img"
        aria-label="Map of the story. Scenes stay locked until you reach them."
      >
        {layout.edges.map((edge) => (
          <StoryMapEdge
            key={`${edge.from.scene.id}-${edge.to.scene.id}`}
            edge={edge}
            isTaken={isVisited(edge.from.scene.id) && isVisited(edge.to.scene.id)}
          />
        ))}
        {layout.nodes.map((node) => (
          <StoryMapNode
            key={node.scene.id}
            node={node}
            isOpening={node.scene.id === props.firstSceneId}
            isVisited={isVisited(node.scene.id)}
            isFound={props.foundEndingIds.includes(node.scene.id)}
            voicing={props.progress?.scenes.find((scene) => scene.id === node.scene.id)}
          />
        ))}
      </svg>
    </div>
  );
}
