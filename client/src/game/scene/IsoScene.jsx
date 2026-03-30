import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { MAP_PATH, TILE_SIZE, MAP_SIZE, COLORS } from '../constants'

const PATH_SET = new Set(MAP_PATH.map(([x, z]) => `${x},${z}`))

export function isOnPath(x, z) { return PATH_SET.has(`${x},${z}`) }

export function isNearPath(x, z) {
  return (
    PATH_SET.has(`${x-1},${z}`) || PATH_SET.has(`${x+1},${z}`) ||
    PATH_SET.has(`${x},${z-1}`) || PATH_SET.has(`${x},${z+1}`)
  )
}

const STRUCTURE_COLORS = {
  archer_tower: 0x8d6e63,
  cannon:       0x616161,
  trap:         0xb0bec5,
  wall:         0x78909c,
}

export default function IsoScene({ onTileClick, structures = [], resources = [], highlightNearPath = false }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const structureMeshesRef = useRef({})
  const resourceMeshesRef = useRef({})

  useEffect(() => {
    const mount = mountRef.current
    const width = mount.clientWidth
    const height = mount.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(COLORS.BG)

    const aspect = width / height
    const viewSize = 14
    const camera = new THREE.OrthographicCamera(
      -viewSize * aspect, viewSize * aspect, viewSize, -viewSize, 0.1, 1000
    )
    camera.position.set(15, 20, 15)
    camera.lookAt(10, 0, 10)

    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(10, 20, 10)
    dirLight.castShadow = true
    scene.add(dirLight)

    // Tiles
    const tileGeo = new THREE.BoxGeometry(TILE_SIZE * 0.95, 0.2, TILE_SIZE * 0.95)
    const tileMeshes = {}
    for (let x = 0; x < MAP_SIZE; x++) {
      for (let z = 0; z < MAP_SIZE; z++) {
        const onPath = isOnPath(x, z)
        const near = isNearPath(x, z)
        const color = onPath
          ? (((x+z) % 2 === 0) ? COLORS.PATH : COLORS.PATH_DARK)
          : (((x+z) % 2 === 0) ? COLORS.GRASS : COLORS.GRASS_DARK)
        const mat = new THREE.MeshLambertMaterial({ color })
        const tile = new THREE.Mesh(tileGeo, mat)
        tile.position.set(x, 0, z)
        tile.receiveShadow = true
        tile.userData = { tileX: x, tileZ: z, onPath, nearPath: near }
        scene.add(tile)
        tileMeshes[`${x},${z}`] = tile
      }
    }

    // Path arrows
    for (let i = 0; i < MAP_PATH.length - 1; i++) {
      const [x1, z1] = MAP_PATH[i]
      const [x2, z2] = MAP_PATH[i + 1]
      const arrowGeo = new THREE.ConeGeometry(0.15, 0.4, 4)
      const arrowMat = new THREE.MeshLambertMaterial({ color: 0xffeb3b })
      const arrow = new THREE.Mesh(arrowGeo, arrowMat)
      arrow.position.set((x1+x2)/2, 0.25, (z1+z2)/2)
      const dx = x2-x1, dz = z2-z1
      arrow.rotation.x = -Math.PI / 2
      if (dx > 0) arrow.rotation.z = -Math.PI / 2
      else if (dx < 0) arrow.rotation.z = Math.PI / 2
      else if (dz < 0) arrow.rotation.z = Math.PI
      scene.add(arrow)
    }

    // Base
    const baseGeo = new THREE.BoxGeometry(1.8, 1.2, 1.8)
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x1565c0 })
    const base = new THREE.Mesh(baseGeo, baseMat)
    const [lastX, lastZ] = MAP_PATH[MAP_PATH.length - 1]
    base.position.set(lastX, 0.7, lastZ)
    base.castShadow = true
    scene.add(base)

    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.5)
    const poleMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const pole = new THREE.Mesh(poleGeo, poleMat)
    pole.position.set(lastX, 2.0, lastZ)
    scene.add(pole)

    const flagGeo = new THREE.BoxGeometry(0.6, 0.4, 0.05)
    const flagMat = new THREE.MeshLambertMaterial({ color: 0xf44336 })
    const flag = new THREE.Mesh(flagGeo, flagMat)
    flag.position.set(lastX + 0.35, 2.5, lastZ)
    scene.add(flag)

    // Spawn marker
    const spawnGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 8)
    const spawnMat = new THREE.MeshLambertMaterial({ color: 0xf44336, transparent: true, opacity: 0.7 })
    const spawnMarker = new THREE.Mesh(spawnGeo, spawnMat)
    const [sx, sz] = MAP_PATH[0]
    spawnMarker.position.set(sx, 0.15, sz)
    scene.add(spawnMarker)

    sceneRef.current = { scene, camera, renderer, flag, tileMeshes }

    // Raycaster
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    function onClick(e) {
      const rect = mount.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(scene.children)
      if (hits.length > 0) {
        const obj = hits[0].object
        if (obj.userData.tileX !== undefined) onTileClick?.(obj.userData)
        if (obj.userData.resourceId !== undefined) onTileClick?.({ ...obj.userData, isResource: true })
      }
    }
    mount.addEventListener('click', onClick)

    let animId
    function animate() {
      animId = requestAnimationFrame(animate)
      flag.rotation.y = Math.sin(Date.now() * 0.003) * 0.3
      renderer.render(scene, camera)
    }
    animate()

    function onResize() {
      const w = mount.clientWidth, h = mount.clientHeight
      const asp = w / h
      camera.left = -viewSize * asp
      camera.right = viewSize * asp
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      mount.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  // Sync structures
  useEffect(() => {
    if (!sceneRef.current) return
    const { scene } = sceneRef.current
    const existing = structureMeshesRef.current

    // Remove old
    for (const id of Object.keys(existing)) {
      if (!structures.find(s => String(s.id) === id)) {
        scene.remove(existing[id])
        delete existing[id]
      }
    }
    // Add new
    for (const s of structures) {
      const key = String(s.id)
      if (!existing[key]) {
        const color = STRUCTURE_COLORS[s.type] || 0x888888
        const geo = new THREE.BoxGeometry(0.8, 1.0, 0.8)
        const mat = new THREE.MeshLambertMaterial({ color })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(s.tileX, 0.6, s.tileZ)
        mesh.castShadow = true
        scene.add(mesh)
        existing[key] = mesh
      }
    }
  }, [structures])

  // Sync resource nodes
  useEffect(() => {
    if (!sceneRef.current) return
    const { scene } = sceneRef.current
    const existing = resourceMeshesRef.current

    for (const id of Object.keys(existing)) {
      if (!resources.find(r => String(r.id) === id)) {
        scene.remove(existing[id])
        delete existing[id]
      }
    }
    for (const r of resources) {
      const key = String(r.id)
      if (!existing[key]) {
        const colors = { wood: 0x795548, stone: 0x9e9e9e, iron: 0xb0bec5 }
        const geo = new THREE.BoxGeometry(0.6, 0.6, 0.6)
        const mat = new THREE.MeshLambertMaterial({ color: colors[r.type] || 0xffffff })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(r.x, 0.5, r.z)
        mesh.castShadow = true
        mesh.userData = { resourceId: r.id, resourceType: r.type }
        scene.add(mesh)
        existing[key] = mesh
      }
    }
  }, [resources])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
