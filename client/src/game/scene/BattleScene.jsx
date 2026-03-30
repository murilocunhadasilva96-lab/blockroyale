import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { MAP_PATH, MAP_SIZE, COLORS } from '../constants'
import { isOnPath, isNearPath } from './IsoScene'

export default function BattleScene({ battleState, structures, onTileClick }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const entityMeshesRef = useRef({ enemies: {}, troops: {}, structures: {} })

  useEffect(() => {
    const mount = mountRef.current
    const W = mount.clientWidth, H = mount.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(COLORS.BG)

    const aspect = W / H
    const viewSize = 14
    const camera = new THREE.OrthographicCamera(
      -viewSize * aspect, viewSize * aspect, viewSize, -viewSize, 0.1, 1000
    )
    camera.position.set(15, 20, 15)
    camera.lookAt(10, 0, 10)

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(10, 20, 10)
    dir.castShadow = true
    scene.add(dir)

    // Map tiles
    const tileGeo = new THREE.BoxGeometry(0.95, 0.2, 0.95)
    for (let x = 0; x < MAP_SIZE; x++) {
      for (let z = 0; z < MAP_SIZE; z++) {
        const onPath = isOnPath(x, z)
        const color = onPath
          ? (((x+z)%2===0) ? COLORS.PATH : COLORS.PATH_DARK)
          : (((x+z)%2===0) ? COLORS.GRASS : COLORS.GRASS_DARK)
        const tile = new THREE.Mesh(tileGeo, new THREE.MeshLambertMaterial({ color }))
        tile.position.set(x, 0, z)
        tile.receiveShadow = true
        tile.userData = { tileX: x, tileZ: z, onPath, nearPath: isNearPath(x, z) }
        scene.add(tile)
      }
    }

    // Path arrows
    for (let i = 0; i < MAP_PATH.length - 1; i++) {
      const [x1,z1] = MAP_PATH[i], [x2,z2] = MAP_PATH[i+1]
      const arrow = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.4, 4),
        new THREE.MeshLambertMaterial({ color: 0xffeb3b })
      )
      arrow.position.set((x1+x2)/2, 0.25, (z1+z2)/2)
      arrow.rotation.x = -Math.PI / 2
      const dx = x2-x1, dz = z2-z1
      if (dx > 0) arrow.rotation.z = -Math.PI/2
      else if (dx < 0) arrow.rotation.z = Math.PI/2
      else if (dz < 0) arrow.rotation.z = Math.PI
      scene.add(arrow)
    }

    // Base
    const [bx, bz] = MAP_PATH[MAP_PATH.length - 1]
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.8,1.2,1.8), new THREE.MeshLambertMaterial({ color: 0x1565c0 }))
    base.position.set(bx, 0.7, bz)
    scene.add(base)
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.5), new THREE.MeshLambertMaterial({ color: 0xffffff }))
    pole.position.set(bx, 2.0, bz)
    scene.add(pole)
    const flagMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.4,0.05), new THREE.MeshLambertMaterial({ color: 0xf44336 }))
    flagMesh.position.set(bx+0.35, 2.5, bz)
    scene.add(flagMesh)

    // Spawn
    const [sx,sz] = MAP_PATH[0]
    const spawn = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.1,8), new THREE.MeshLambertMaterial({ color: 0xf44336, transparent:true, opacity:0.7 }))
    spawn.position.set(sx, 0.15, sz)
    scene.add(spawn)

    sceneRef.current = { scene, camera, renderer, flagMesh }

    // Raycaster
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    function onClick(e) {
      const rect = mount.getBoundingClientRect()
      mouse.x = ((e.clientX-rect.left)/rect.width)*2-1
      mouse.y = -((e.clientY-rect.top)/rect.height)*2+1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(scene.children)
      if (hits.length > 0 && hits[0].object.userData.tileX !== undefined) {
        onTileClick?.(hits[0].object.userData)
      }
    }
    mount.addEventListener('click', onClick)

    let animId
    function animate() {
      animId = requestAnimationFrame(animate)
      flagMesh.rotation.y = Math.sin(Date.now()*0.003)*0.3
      renderer.render(scene, camera)
    }
    animate()

    function onResize() {
      const w = mount.clientWidth, h = mount.clientHeight, asp = w/h
      camera.left = -viewSize*asp; camera.right = viewSize*asp
      camera.updateProjectionMatrix(); renderer.setSize(w, h)
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

  // Sync entities every frame
  useEffect(() => {
    if (!sceneRef.current || !battleState) return
    const { scene } = sceneRef.current
    const meshes = entityMeshesRef.current

    // --- Enemies ---
    const liveEnemyIds = new Set(battleState.enemies.map(e => e.id))
    for (const id of Object.keys(meshes.enemies)) {
      if (!liveEnemyIds.has(Number(id))) { scene.remove(meshes.enemies[id]); delete meshes.enemies[id] }
    }
    for (const e of battleState.enemies) {
      if (!meshes.enemies[e.id]) {
        const g = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,0.6), new THREE.MeshLambertMaterial({ color: e.color }))
        g.castShadow = true
        scene.add(g)
        meshes.enemies[e.id] = g
      }
      meshes.enemies[e.id].position.set(e.x, 0.5, e.z)
      // HP bar color
      const pct = e.hp / e.maxHp
      meshes.enemies[e.id].material.color.setHex(pct > 0.5 ? 0xef5350 : 0xb71c1c)
    }

    // --- Troops ---
    const liveTroopIds = new Set(battleState.troops.map(t => t.id))
    for (const id of Object.keys(meshes.troops)) {
      if (!liveTroopIds.has(Number(id))) { scene.remove(meshes.troops[id]); delete meshes.troops[id] }
    }
    for (const t of battleState.troops) {
      if (!meshes.troops[t.id]) {
        const g = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.7,0.5), new THREE.MeshLambertMaterial({ color: t.color }))
        g.castShadow = true
        scene.add(g)
        meshes.troops[t.id] = g
      }
      meshes.troops[t.id].position.set(t.x, 0.5, t.z)
    }

    // --- Structures ---
    const SCOLS = { archer_tower:0x8d6e63, cannon:0x616161, trap:0xb0bec5, wall:0x78909c }
    const liveStructIds = new Set(battleState.structures.map(s => s.id))
    for (const id of Object.keys(meshes.structures)) {
      if (!liveStructIds.has(Number(id))) { scene.remove(meshes.structures[id]); delete meshes.structures[id] }
    }
    for (const s of battleState.structures) {
      if (s.hp <= 0) { if (meshes.structures[s.id]) { scene.remove(meshes.structures[s.id]); delete meshes.structures[s.id] } continue }
      if (!meshes.structures[s.id]) {
        const g = new THREE.Mesh(new THREE.BoxGeometry(0.8,1.0,0.8), new THREE.MeshLambertMaterial({ color: SCOLS[s.type]||0x888888 }))
        g.castShadow = true; scene.add(g)
        meshes.structures[s.id] = g
      }
      meshes.structures[s.id].position.set(s.tileX, 0.6, s.tileZ)
    }
  }, [battleState])

  return <div ref={mountRef} style={{ width:'100%', height:'100%' }} />
}
