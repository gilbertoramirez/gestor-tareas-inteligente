/// <reference path="../tipos/express.d.ts" />

import { Request, Response } from 'express';
import { servicioTareas } from '../servicios';
import { CrearTareaDTO, ActualizarTareaDTO } from '../modelos';

export class ControladorTareas {
  
  async crearTarea(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.uid;
      
      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      
      const datos: CrearTareaDTO = req.body;
      
      if (!datos.titulo || datos.titulo.trim() === '') {
        return res.status(400).json({ error: 'El título es requerido' });
      }
      
      if (!datos.fechaVencimiento) {
        return res.status(400).json({ error: 'La fecha de vencimiento es requerida' });
      }
      
      if (datos.beneficio === undefined || datos.beneficio < 0 || datos.beneficio > 100) {
        return res.status(400).json({ error: 'El beneficio debe estar entre 0 y 100' });
      }
      
      if (!datos.horasEstimadas || datos.horasEstimadas <= 0) {
        return res.status(400).json({ error: 'Las horas estimadas deben ser mayor a 0' });
      }
      
      const tarea = await servicioTareas.crearTarea(usuarioId, datos);
      
      return res.status(201).json({
        mensaje: 'Tarea creada exitosamente',
        tarea
      });
      
    } catch (error: any) {
      console.error('Error en crearTarea:', error);
      return res.status(500).json({ 
        error: 'Error al crear la tarea',
        detalle: error.message 
      });
    }
  }
  
  async listarTareas(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.uid;
      
      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      
      const { estado, etiqueta, ordenarPor } = req.query;
      
      const filtros: any = {};
      if (estado) filtros.estado = estado;
      if (etiqueta) filtros.etiqueta = etiqueta;
      if (ordenarPor) filtros.ordenarPor = ordenarPor;
      
      const tareas = await servicioTareas.listarTareas(usuarioId, filtros);
      
      return res.json({
        total: tareas.length,
        tareas
      });
      
    } catch (error: any) {
      console.error('Error en listarTareas:', error);
      return res.status(500).json({ 
        error: 'Error al obtener las tareas',
        detalle: error.message 
      });
    }
  }
  
  async obtenerTarea(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.uid;
      const { id } = req.params;
      
      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      
      const tarea = await servicioTareas.obtenerTareaPorId(id, usuarioId);
      
      if (!tarea) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      
      return res.json({ tarea });
      
    } catch (error: any) {
      console.error('Error en obtenerTarea:', error);
      
      if (error.message.includes('permiso')) {
        return res.status(403).json({ error: error.message });
      }
      
      return res.status(500).json({ 
        error: 'Error al obtener la tarea',
        detalle: error.message 
      });
    }
  }
  
  async actualizarTarea(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.uid;
      const { id } = req.params;
      const datos: ActualizarTareaDTO = req.body;
      
      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      
      const tarea = await servicioTareas.actualizarTarea(id, usuarioId, datos);
      
      return res.json({
        mensaje: 'Tarea actualizada exitosamente',
        tarea
      });
      
    } catch (error: any) {
      console.error('Error en actualizarTarea:', error);
      
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({ error: error.message });
      }
      
      if (error.message.includes('permiso')) {
        return res.status(403).json({ error: error.message });
      }
      
      return res.status(500).json({ 
        error: 'Error al actualizar la tarea',
        detalle: error.message 
      });
    }
  }
  
  async eliminarTarea(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.uid;
      const { id } = req.params;
      
      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      
      await servicioTareas.eliminarTarea(id, usuarioId);
      
      return res.json({
        mensaje: 'Tarea eliminada exitosamente'
      });
      
    } catch (error: any) {
      console.error('Error en eliminarTarea:', error);
      
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({ error: error.message });
      }
      
      if (error.message.includes('permiso')) {
        return res.status(403).json({ error: error.message });
      }
      
      return res.status(500).json({ 
        error: 'Error al eliminar la tarea',
        detalle: error.message 
      });
    }
  }
  
  async obtenerListaPrioridades(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.uid;
      
      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      
      const tareas = await servicioTareas.listarTareas(usuarioId, {
        ordenarPor: 'prioridad'
      });
      
      const tareasActivas = tareas.filter(t => 
        t.estado !== 'completada' && t.estado !== 'cancelada'
      );
      
      return res.json({
        total: tareasActivas.length,
        tareas: tareasActivas
      });
      
    } catch (error: any) {
      console.error('Error en obtenerListaPrioridades:', error);
      return res.status(500).json({ 
        error: 'Error al obtener la lista de prioridades',
        detalle: error.message 
      });
    }
  }
  
  /**
   * POST /api/tareas/:id/subtareas - Agregar subtarea
   */
  async agregarSubtarea(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.uid;
      const { id } = req.params;
      const { titulo, descripcion } = req.body;
      
      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      
      if (!titulo || titulo.trim() === '') {
        return res.status(400).json({ error: 'El título de la subtarea es requerido' });
      }
      
      const tarea = await servicioTareas.agregarSubtarea(
        id,
        usuarioId,
        titulo,
        descripcion || ''
      );
      
      return res.status(201).json({
        mensaje: 'Subtarea agregada exitosamente',
        tarea
      });
      
    } catch (error: any) {
      console.error('Error en agregarSubtarea:', error);
      return res.status(500).json({
        error: 'Error al agregar subtarea',
        detalle: error.message
      });
    }
  }
  
  /**
   * PATCH /api/tareas/:id/subtareas/:subtareaId - Actualizar subtarea
   */
  async actualizarSubtarea(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.uid;
      const { id, subtareaId } = req.params;
      const { estado } = req.body;
      
      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      
      if (!estado || !['pendiente', 'completada'].includes(estado)) {
        return res.status(400).json({ 
          error: 'Estado inválido. Debe ser "pendiente" o "completada"' 
        });
      }
      
      const tarea = await servicioTareas.actualizarSubtarea(
        id,
        usuarioId,
        subtareaId,
        estado
      );
      
      return res.json({
        mensaje: 'Subtarea actualizada exitosamente',
        tarea
      });
      
    } catch (error: any) {
      console.error('Error en actualizarSubtarea:', error);
      return res.status(500).json({
        error: 'Error al actualizar subtarea',
        detalle: error.message
      });
    }
  }
  
  /**
   * DELETE /api/tareas/:id/subtareas/:subtareaId - Eliminar subtarea
   */
  async eliminarSubtarea(req: Request, res: Response) {
    try {
      const usuarioId = req.usuario?.uid;
      const { id, subtareaId } = req.params;
      
      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      
      const tarea = await servicioTareas.eliminarSubtarea(
        id,
        usuarioId,
        subtareaId
      );
      
      return res.json({
        mensaje: 'Subtarea eliminada exitosamente',
        tarea
      });
      
    } catch (error: any) {
      console.error('Error en eliminarSubtarea:', error);
      return res.status(500).json({
        error: 'Error al eliminar subtarea',
        detalle: error.message
      });
    }
  }
}

export const controladorTareas = new ControladorTareas();
