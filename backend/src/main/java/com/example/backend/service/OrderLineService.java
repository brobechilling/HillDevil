package com.example.backend.service;

import com.example.backend.dto.OrderLineDTO;
import com.example.backend.dto.request.CreateOrderLineRequest;
import com.example.backend.dto.request.UpdateOrderLineStatusRequest;
import com.example.backend.entities.AreaTable;
import com.example.backend.entities.Branch;
import com.example.backend.entities.Order;
import com.example.backend.entities.OrderItem;
import com.example.backend.entities.OrderLine;
import com.example.backend.entities.OrderLineStatus;
import com.example.backend.entities.OrderStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.OrderItemMapper;
import com.example.backend.mapper.OrderLineMapper;
import com.example.backend.repository.BranchRepository;
import com.example.backend.repository.OrderLineRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.TableRepository;

import org.slf4j.Logger;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class OrderLineService {

    private final OrderLineRepository orderLineRepository;
    private final OrderRepository orderRepository;
    private final OrderLineMapper orderLineMapper;
    private final OrderItemService orderItemService;
    private final TableRepository tableRepository;
    private final BranchRepository branchRepository;
    private Logger logger = org.slf4j.LoggerFactory.getLogger(getClass());

    public OrderLineService(OrderLineRepository orderLineRepository,
                            OrderLineMapper orderLineMapper,
                            OrderItemService orderItemService,
                            OrderRepository orderRepository,
                            TableRepository tableRepository,
                            BranchRepository branchRepository) {
        this.orderLineRepository = orderLineRepository;
        this.orderLineMapper = orderLineMapper;
        this.orderItemService = orderItemService;
        this.orderRepository = orderRepository;
        this.tableRepository = tableRepository;
        this.branchRepository = branchRepository;
    }

    public boolean createOrderLine(CreateOrderLineRequest createOrderLineRequest) {
        // check whether this order line is first 
        OrderLine orderLine = new OrderLine();
        Order order = checkOrderExist(createOrderLineRequest.getAreaTableId());
        orderLine.setOrder(order);
        orderLine.setOrderLineStatus(OrderLineStatus.PENDING);
        OrderLine savedOrderLine = orderLineRepository.save(orderLine);
        // save the orderLine first then take it to use in orderItemService.createOrderItem
        savedOrderLine.setOrderItems(orderItemService.createOrderItem(createOrderLineRequest.getOrderItems(), savedOrderLine));
        savedOrderLine.setTotalPrice(getOrderLinePrice(savedOrderLine.getOrderItems()));
        order.setTotalPrice(order.getTotalPrice().add(savedOrderLine.getTotalPrice()));
        return orderRepository.save(order) != null && orderLineRepository.save(savedOrderLine) != null;
    }

    private BigDecimal getOrderLinePrice(Set<OrderItem> orderItems) {
        BigDecimal orderLinePrice = BigDecimal.ZERO;
        for (OrderItem orderItem : orderItems) {
            if (orderItem.isStatus())
                orderLinePrice = orderLinePrice.add(orderItem.getTotalPrice());
        }
        return orderLinePrice;
    }

    private Order createOrder(UUID areaTableId) {
        Order order = new Order();
        order.setAreaTable(tableRepository.findById(areaTableId).orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND)));
        order.setStatus(OrderStatus.EATING);
        return orderRepository.save(order);
    }

    // find the latest order of this table. If exist then there is currently customer eating at this table. If not then there is no customer at this table 
    // -> we create a new order for the new orderline. 
    // => this orderline will be the first orderline of this order of this table
    // might need to check table status as well
    private Order checkOrderExist(UUID areaTableId) {
        return orderRepository.findTopByAreaTable_AreaTableIdAndStatusOrderByUpdatedAtDesc(areaTableId, OrderStatus.EATING).orElseGet( () -> createOrder(areaTableId));
    }

    // this returns orderItems with status false because of soft delete and mapping using mapstruct -> can try to fix this in mapper
    public List<OrderLineDTO> getOrderLinesByStatusAndBranch(UUID branchId, OrderLineStatus orderLineStatus) {
        Branch branch = branchRepository.findById(branchId).orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        List<OrderLine> orderLines = orderLineRepository.findAllByOrderLineStatusAndOrder_AreaTable_Area_Branch(orderLineStatus, branch);
        List<OrderLineDTO> orderLineDTOs = new ArrayList<>();
        for (OrderLine orderLine : orderLines) {
            OrderLineDTO orderLineDTO = orderLineMapper.toOrderLineDTO(orderLine);
            AreaTable table = orderLine.getOrder().getAreaTable();
            orderLineDTO.setTableTag(table.getTag());
            orderLineDTO.setAreaName(table.getArea().getName());
            orderLineDTOs.add(orderLineDTO);
        }
        return orderLineDTOs;
    }

    public boolean setOrderLineStatus(UpdateOrderLineStatusRequest request) {
        OrderLine orderLine = orderLineRepository.findById(request.getOrderLineId()).orElseThrow(() -> new AppException(ErrorCode.ORDERLINE_NOT_EXISTS));
        orderLine.setOrderLineStatus(request.getOrderLineStatus());
        return orderLineRepository.save(orderLine) != null;
    }

    
}
